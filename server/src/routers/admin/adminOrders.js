const express = require("express");
const { userAuth } = require("../../middleware/Auth");
const { authorize } = require("../../middleware/Role");
const {
  getAllOrders,
  getPersonalOrderById,
  updateOrderStatus,
} = require("../../controllers/orderController");

const adminOrders = express.Router();

/*
GET     /admin/orders                   -> list all orders
GET     /admin/orders/:orderId          -> view single order details
PATCH   /admin/orders/:orderId/status   -> update order status (confirmed/packed/shipped/delivered)
GET     /admin/users/:userId/orders     -> list all orders of a specific user   (optional)
PATCH   /admin/orders/:orderId/cancel   -> cancel an order                      (optional)

*/

adminOrders.get("/", userAuth, authorize("admin"), getAllOrders);
adminOrders.get("/:id", userAuth, authorize("admin"), getPersonalOrderById);
adminOrders.patch(
  "/:orderId/status",
  userAuth,
  authorize("admin"),
  updateOrderStatus
);

module.exports = adminOrders;
