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
const {
  getPersonalOrders,
  getOrderById,
  getOrderByFilter,
  updateOrderStatusById,
} = require("../services/orderService");

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

    const order = getPersonalOrders(user._id);

    await setCache(key, foundOrder);

    return res.json({
      message: "Orders fetched!",
      ordersLength: order.length,
      orders: order,
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
      const orderId = req.params.id;

      const key = buildKey("order:details", { orderId: orderId });
      const cachedOrders = await getCache(key);
      if (cachedOrders) {
        return res.json({
          message: "Order fetched from cache!",
          order: cachedOrders,
        });
      }

      const order = await getOrderById(orderId);

      await setCache(key, foundOrder);

      return res.json({
        message: "Order Fetched!",
        order: order,
      });
    } catch (err) {
      next(err);
    }
  }
);

orderRouter.get(
  "/orders",
  userAuth,
  authorize("admin"),
  userLimiter,
  async (req, res, next) => {
    try {
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

      const orders = await getOrderByFilter(req.query);

      const responseData = {
        message: "All orders Fetched!",
        totalOrders: Number(totalOrders),
        totalPages: Number(totalPages),
        page: Number(page),
        limit: Number(limit),
        orders,
      };

      await setCache(key, responseData, 60);

      return res.json(responseData);
    } catch (err) {
      next(err);
    }
  }
);

orderRouter.put(
  "/orders/:id/status",
  userAuth,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { orderStatus } = req.body;
      const { id } = req.params;

      const order = await updateOrderStatusById(id, orderStatus);

      const orderDetailsKey = buildKey("order:details", { orderId: id });
      const myOrdersKey = buildKey("orders:my", {
        userId: order.userId.toString(),
      });

      await removeCache(orderDetailsKey);
      await removeCache(myOrdersKey);

      res.json({
        message: "Order status Updated Successfully!",
        updatedOrder: order,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = orderRouter;
