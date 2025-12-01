const express = require("express");

const { userAuth } = require("../middleware/Auth");

const { userLimiter } = require("../utils/rateLimiter");
const { authorize } = require("../middleware/Role");

const {
  getMyOrder,
  getPersonalOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const orderRouter = express.Router();

// in /orders/my API, the particular logged in user (be it normal user or admin) can only see his/her personal orders, not of others
orderRouter.get("/orders/my", userAuth, userLimiter, getMyOrder);

/* /orders/:id behavior:

If the logged-in user is a normal user:
- They can access only their own order with that ID.
- If the order belongs to someone else → blocked.

If the logged-in user is an admin:
- They can access any user's order by ID.
- No restriction.

*/
orderRouter.get("/orders/:id", userAuth, userLimiter, getPersonalOrderById);

orderRouter.get(
  "/orders",
  userAuth,
  authorize("admin"),
  userLimiter,
  getAllOrders
);

orderRouter.put(
  "/orders/:id/status",
  userAuth,
  authorize("admin"),
  updateOrderStatus
);

module.exports = orderRouter;
