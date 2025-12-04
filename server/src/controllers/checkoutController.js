const { orderQueue } = require("../bullmq/queues/orderQueue");
const { processOrder, getCheckoutSummary } = require("../services/checkoutService");

async function calculateCheckoutSummary(req, res, next) {
  try {
    const summary = await getCheckoutSummary(req.user._id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

async function processCheckoutPayment(req, res, next) {
  try {
    const user = req.user;
    const { shippingAddress } = req.body;

    const order = await processOrder(user, shippingAddress);

    // adding Background job (BullMQ)
    await orderQueue.add("processOrder", {
      userId: user._id,
      orderId: order._id,
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

module.exports = {
  calculateCheckoutSummary,
  processCheckoutPayment,
};
