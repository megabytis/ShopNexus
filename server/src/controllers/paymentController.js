const { orderModel } = require("../models/order");
const { userModel } = require("../models/user");
const { getCart } = require("../services/cartService");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res, next) => {
  try {
    const user = req.user;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // 1. Get Cart Total (Secure calculation)
    const cartData = await getCart(user._id);
    if (!cartData.cart || cartData.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cartData.totalAmount; // This is in Rupees (e.g. 100.50)
    const amountInPaise = Math.round(totalAmount * 100);

    if (amountInPaise < 50) { // Stripe minimum is usually around 50 cents/paise equivalent
        return res.status(400).json({ message: "Order amount too low" });
    }

    // 2. Create Order with status 'pending' (or 'processing' but paymentStatus 'pending')
    // The order schema defaults paymentStatus to 'pending'.
    // We need to map cart items to order items schema
    const orderItems = cartData.cart.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        priceAtPurchase: item.productId.price
    }));

    const newOrder = new orderModel({
        userId: user._id,
        items: orderItems,
        totalAmount: totalAmount,
        shippingAddress: shippingAddress,
        paymentStatus: 'pending',
        orderStatus: 'processing' 
    });

    await newOrder.save();

    // 3. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: "inr",
      metadata: {
        orderId: newOrder._id.toString(),
        userId: user._id.toString()
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: newOrder._id
    });

  } catch (err) {
    next(err);
  }
};

const webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const { orderId, userId } = paymentIntent.metadata;

      console.log(`PaymentIntent was successful for Order ${orderId}!`);

      // Update Order Status
      if (orderId) {
          await orderModel.findByIdAndUpdate(orderId, {
              paymentStatus: 'paid'
          });

          // Clear User Cart
          if (userId) {
              const user = await userModel.findById(userId);
              if (user) {
                  user.cart = [];
                  await user.save();
              }
          }
      }
      break;
    case "payment_intent.payment_failed":
        const failedIntent = event.data.object;
        const failedOrderId = failedIntent.metadata.orderId;
        if (failedOrderId) {
            await orderModel.findByIdAndUpdate(failedOrderId, {
                paymentStatus: 'failed'
            });
        }
        break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

module.exports = {
  createPaymentIntent,
  webhook,
};
