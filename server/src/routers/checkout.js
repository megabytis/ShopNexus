const express = require("express");
const { userAuth } = require("../middleware/Auth");
const { userModel } = require("../models/user");
const { writeLimiter } = require("../utils/rateLimiter");

const { orderQueue } = require("../bullmq/queues/orderQueue");
const { processOrder } = require("../services/checkoutService");
const { getCheckoutSummary } = require("../services/checkoutSummaryService");

const checkoutRouter = express.Router();

// Checkout Summary
/*
# what we need :
1. total amount of entire cart
2. verifying wheather the selected quantity of each product is less than or equals with the available stock of the product 
3. preparation of Razorpay session / any dummy payment integration

---logic----
- first loop over user's cart and calculate total quantity
- in the same loop collect each product's product id, use productModel to verify product and it's stock
*/

checkoutRouter.post(
  "/checkout/summary",
  userAuth,
  writeLimiter,
  async (req, res, next) => {
    try {
      const summary = getCheckoutSummary(req.user._id);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  }
);

// Now Payment
/*
What it will do :

1. Re-validates the cart
2. Re-calculates total (security)
3. Creates the Order
4. Deducts stock
5. Clears the user’s cart
6. Returns success response
*/
checkoutRouter.post(
  "/checkout/pay",
  userAuth,
  writeLimiter,
  async (req, res, next) => {
    try {
      const user = req.user;
      const { shippingAddress } = req.body;

      const order = processOrder(user, shippingAddress);

      // adding Background job (BullMQ)
      await orderQueue.add("processOrder", {
        userId: user._id,
        orderId: newOrder._id,
        email: user.email,
      });

      return res.status(201).json({
        message: "Payment successful! Order created.",
        order: order,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = checkoutRouter;
