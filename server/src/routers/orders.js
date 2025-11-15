const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { orderModel } = require("../models/order");

const orderRouter = express.Router();

// Fetching all Orders
orderRouter.get("/orders/my", userAuth, async (req, res, next) => {
  const user = req.user;
  const foundOrders = await orderModel
    .find({ userId: user._id })
    .sort({ createdAt: -1 });

  if (foundOrders.length === 0) {
    throw new Error("Orders not Found!");
  }

  res.json({
    message: "Orders fetched!",
    ordersLength: foundOrders.length,
    orders: foundOrders,
  });
});

module.exports = orderRouter;
