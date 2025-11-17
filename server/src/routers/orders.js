const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { orderModel } = require("../models/order");

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
      ordersLength: foundOrder.length,
      orders: foundOrder,
    });
  } catch (err) {
    next(err);
  }
});

orderRouter.get("/orders", userAuth, async (req, res, next) => {
  const user = req.user;

  if (user.role !== "admin") {
    throw new Error("U r not Authorized to see all Orders!");
  }

  const allOrders = await orderModel.find().sort({ createdAt: -1 });

  res.json({
    message: "All orders Fetched!",
    totalOrders: allOrders.length,
    allOrders,
  });
});

module.exports = orderRouter;
