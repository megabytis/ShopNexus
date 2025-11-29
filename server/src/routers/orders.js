const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { orderModel } = require("../models/order");
const { validateOrderStatus } = require("../utils/validate");
const { userModel } = require("../models/user");
const { productModel } = require("../models/product");
const { default: mongoose } = require("mongoose");
const { setCache, getCache, removeCache } = require("../utils/cache");
const { buildKey } = require("../utils/keyGenerator");
const { userLimiter } = require("../utils/rateLimiter");
const { authorize } = require("../middleware/Role");

const orderRouter = express.Router();

// in /orders/my API, the particular logged in user (be it normal user or admin) can only see his/her personal orders, not of others
orderRouter.get("/orders/my", userAuth, userLimiter, async (req, res, next) => {
  try {
    const user = req.user;

    const key = buildKey("orders:my", { userId: user._id });
    const cachedOrders = await getCache(key);
    if (cachedOrders) {
      return res.json({
        message: "Orders fetched from cache!",
        ordersLength: cachedOrders.length,
        orders: cachedOrders,
      });
    }

    const foundOrder = await orderModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 });

    if (!foundOrder.length) {
      return res.json({
        message: "No orders yet!",
        ordersLength: 0,
        orders: [],
      });
    }

    await setCache(key, foundOrder);

    return res.json({
      message: "Orders fetched!",
      ordersLength: foundOrder.length,
      orders: foundOrder,
    });
  } catch (err) {
    next(err);
  }
});

/* /orders/:id behavior:

If the logged-in user is a normal user:
- They can access only their own order with that ID.
- If the order belongs to someone else → blocked.

If the logged-in user is an admin:
- They can access any user's order by ID.
- No restriction.

*/
orderRouter.get(
  "/orders/:id",
  userAuth,
  authorize("admin"),
  userLimiter,
  async (req, res, next) => {
    try {
      const user = req.user;
      const orderId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error("Invalid OrderId!");
      }

      const key = buildKey("order:details", { orderId: orderId });
      const cachedOrders = await getCache(key);
      if (cachedOrders) {
        return res.json({
          message: "Order fetched from cache!",
          order: cachedOrders,
        });
      }

      const foundOrder = await orderModel.findById(orderId);
      if (!foundOrder) {
        throw new Error("Order not found!");
      }

      const isOwnerOfTheOrderId =
        foundOrder.userId.toString() === user._id.toString();
      if (!isOwnerOfTheOrderId) {
        throw new Error("Access Denied! You can't view this order!");
      }

      await setCache(key, foundOrder);

      return res.json({
        message: "Order Fetched!",
        order: foundOrder,
      });
    } catch (err) {
      next(err);
    }
  }
);

orderRouter.get("/orders", userAuth, authorize("admin"),userLimiter, async (req, res, next) => {
  try {
    const user = req.user;

    let {
      page,
      limit,
      orderStatus, // "processing", "shipped", "delivered", "cancelled"
      paymentStatus, // "paid", "pending", "failed"
      min, // minimum totalAmount
      max, // maximum totalAmount
      from, // createdAt >= from
      to, // createdAt <= to
      userId, // filter orders of a specific user (admin use)
      productId, // filter orders containing a specific product
      sortBy, // field to sort (createdAt, totalAmount)
      order, // asc / desc
    } = req.query;

    const orderQuery = {};

    // ---------------MIN-MAX FILTER----------------
    // imp: converting both min, max to Number before inserting it to query

    if (min && max) {
      min = Number(min);
      max = Number(max);
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        orderQuery.totalAmount = {
          $gte: min,
          $lte: max,
        };
      }
    } else if (min) {
      min = Number(min);
      if (!Number.isNaN(min)) {
        orderQuery.totalAmount = {
          $gte: min,
        };
      }
    } else if (max) {
      max = Number(max);
      if (!Number.isNaN(max)) {
        orderQuery.totalAmount = {
          $lte: max,
        };
      }
    }

    // --------------orderStatus FIlter--------------
    // logic: assign the value if EXISTS and VALID otherwise leave it
    const validOrderStatus = [
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (orderStatus && validOrderStatus.includes(orderStatus)) {
      orderQuery.orderStatus = orderStatus;
    }

    // ----------paymentStatus Filter---------------
    // logic is same like order Status
    const validatePaymentStatus = ["paid", "pending", "failed"];

    if (paymentStatus && validatePaymentStatus.includes(paymentStatus)) {
      orderQuery.paymentStatus = paymentStatus;
    }

    // -----------------userId Filter-----------------
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const isUserIdValid = await userModel.findById(userId.toString());
      if (isUserIdValid) {
        orderQuery.userId = userId;
      }
    }

    // ----------------productId Filter-------------------------
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      const isValidProductId = await productModel.findById(
        productId.toString()
      );
      if (isValidProductId) {
        orderQuery["items.productId"] = new mongoose.Types.ObjectId(productId);
      }
    }

    // -------------FROM-TO Filter-------------------
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      if (fromDate <= toDate && !isNaN(fromDate) && !isNaN(toDate)) {
        orderQuery.createdAt = {
          $gte: fromDate,
          $lte: toDate,
        };
      }
    } else if (from) {
      orderQuery.createdAt = {
        $gte: new Date(from),
      };
    } else if (to) {
      let toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      orderQuery.createdAt = {
        $lte: new Date(toDate),
      };
    }

    // ---------------SORT-BY & ORDER FILTER-------------------
    let finalSortField;
    const allowedfinalSortFields = [
      "createdAt",
      "totalAmount",
      "orderStatus",
      "paymentStatus",
    ];
    if (sortBy && allowedfinalSortFields.includes(sortBy)) {
      finalSortField = sortBy.toString();
    } else {
      finalSortField = "createdAt";
    }

    let finalSortDirection;
    if (order === "asc") {
      finalSortDirection = 1;
    } else if (order === "desc") {
      finalSortDirection = -1;
    } else {
      finalSortDirection = -1;
    }

    const sortObject = { [finalSortField]: finalSortDirection };

    // --------------PAGE FILTER-----------

    page = parseInt(page) || 1;

    const MAX_LIMIT = 5;
    limit = parseInt(req.query.limit) || MAX_LIMIT;
    limit = limit > MAX_LIMIT ? MAX_LIMIT : limit;

    const skip = (page - 1) * limit;

    const key = buildKey("orders", {
      page,
      limit,
      orderStatus,
      paymentStatus,
      min,
      max,
      from,
      to,
      userId,
      productId,
      sortBy,
      order,
    });

    const cachedResponse = await getCache(key);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const totalOrders = await orderModel.countDocuments(orderQuery);
    const totalPages = Math.ceil(totalOrders / limit);

    if (page > totalPages && totalPages > 0) {
      throw new Error("Page is not available!");
    }

    const allOrders = await orderModel
      .find(orderQuery)
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    const responseData = {
      message: "All orders Fetched!",
      totalOrders,
      totalPages,
      page: Number(page),
      limit: Number(limit),
      allOrders,
    };

    await setCache(key, responseData, 60);

    return res.json(responseData);
  } catch (err) {
    next(err);
  }
});

orderRouter.put("/orders/:id/status", userAuth, authorize("admin"),async (req, res, next) => {
  try {
    const user = req.user;
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid MongoId!");
    }
    validateOrderStatus(req);

    const foundOrder = await orderModel.findById(id);
    if (!foundOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrderStatus = await orderModel.findByIdAndUpdate(
      id,
      {
        orderStatus: orderStatus.toString(),
      },
      { new: true }
    );

    const orderDetailsKey = buildKey("order:details", { orderId: id });
    const myOrdersKey = buildKey("orders:my", {
      userId: foundOrder.userId.toString(),
    });

    await removeCache(orderDetailsKey);
    await removeCache(myOrdersKey);

    res.json({
      message: "Order status Updated Successfully!",
      updatedOrder: updatedOrderStatus,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = orderRouter;
