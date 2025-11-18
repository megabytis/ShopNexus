const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { orderModel } = require("../models/order");
const { validateMongoID, validateOrderStatus } = require("../utils/validate");
const { userModel } = require("../models/user");
const { productModel } = require("../models/product");
const { default: mongoose } = require("mongoose");

const orderRouter = express.Router();

// in /orders/my API, the particular logged in user (be it normal user or admin) can only see his/her personal orders, not of others
orderRouter.get("/orders/my", userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    const foundOrder = await orderModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 });

    if (foundOrder.length === 0) {
      throw new Error("Orders not Found!");
    }

    res.json({
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
orderRouter.get("/orders/:id", userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    const orderId = req.params.id;
    mongoose.Types.ObjectId.isValid(orderId);

    const foundOrder = await orderModel.findById(orderId);

    if (!foundOrder) {
      throw new Error("Order not found!");
    }

    const isAdmin = user.role === "admin";
    const isOwnerOfTheOrderId =
      foundOrder.userId.toString() === user._id.toString();

    if (!isOwnerOfTheOrderId && !isAdmin) {
      throw new Error("Access Denied! You can't view this order!");
    }

    res.json({
      messege: "Orders Fetched!",
      order: foundOrder,
    });
  } catch (err) {
    next(err);
  }
});

orderRouter.get("/orders", userAuth, async (req, res, next) => {
  const user = req.user;

  if (user.role !== "admin") {
    throw new Error("Access Denied. You're not Authorised!");
  }

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
  const validOrderStatus = ["processing", "shipped", "delivered", "cancelled"];

  if (orderStatus && validOrderStatus.includes(orderStatus)) {
    orderQuery.orderStatus = orderStatus;
  } else {
    // throw new Error("Invalid orderSttaus Filter!");
    // or better
    // ignore this filter , which is fat better & softer than throwing error in query cases
  }

  // ----------paymentStatus Filter---------------
  // logic is same like order Status
  const validatePaymentStatus = ["paid", "pending", "failed"];

  if (paymentStatus && validatePaymentStatus.includes(paymentStatus)) {
    orderQuery.paymentStatus = paymentStatus;
  }

  // -----------------userId Filter-----------------
  if (userId) {
    mongoose.Types.ObjectId.isValid(userId);
    const isUserIdValid = await userModel.findById(userId.toString());
    if (isUserIdValid) {
      orderQuery.userId = userId;
    }
  }

  // ----------------productId Filter-------------------------
  if (productId) {
    mongoose.Types.ObjectId.isValid(productId);
    const isValidProductId = await productModel.findById(productId.toString());
    if (isValidProductId) {
      orderQuery["items.productId"] = productId;
    }
  }

  // -------------FROM-TO Filter-------------------
  if (from && to) {
    let toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    orderQuery.createdAt = {
      $gte: new Date(from),
      $lte: toDate,
    };
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

  const totalOrders = await orderModel.countDocuments(orderQuery);
  const totalPages = Math.ceil(totalOrders / limit);

  if (page > totalPages && totalPages > 0) {
    throw new Error("Page is not available!");
  }

  if (user.role !== "admin") {
    throw new Error("U r not Authorized to see all Orders!");
  }

  const allOrders = await orderModel
    .find(orderQuery)
    .sort(sortObject)
    .skip(skip)
    .limit(limit);

  res.json({
    message: "All orders Fetched!",
    totalOrders,
    totalPages,
    page: Number(page),
    limit: Number(limit),
    allOrders,
  });
});

orderRouter.put("/orders/:id/status", userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    const { orderStatus } = req.body;
    const { id } = req.params;

    mongoose.Types.ObjectId.isValid(id);
    validateOrderStatus(req);

    if (user.role !== "admin") {
      throw new Error("U r not Authorized to see all Orders!");
    }

    const foundOrder = await orderModel.findById(id);
    if (!foundOrder) {
      throw new Error("Order doesn't exist!");
    }

    const updatedOrderStatus = await orderModel.findByIdAndUpdate(
      id,
      {
        orderStatus: orderStatus.toString(),
      },
      { new: true }
    );

    res.json({
      message: "Order status Updated Successfully!",
      updatedOrder: updatedOrderStatus,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = orderRouter;
