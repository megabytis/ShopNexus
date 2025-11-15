const express = require("express");
const { userAuth } = require("../middleware/Auth");
const { userModel } = require("../models/user");
const { orderModel } = require("../models/order");
const { productModel } = require("../models/product");

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

checkoutRouter.post("/checkout/summary", userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    let totalAmount = 0.0;

    const cartDetails = await userModel
      .findById(user._id.toString())
      .select("cart")
      .populate("cart.productId");

    // verifying each product and calculating total Amount
    for (const item of cartDetails.cart) {
      const availableProduct = item.productId;

      if (!availableProduct) {
        throw new Error("Product no longer Exists!");
      }

      // checking if stock is available or not
      if (availableProduct.stock < item.quantity) {
        throw new Error(
          `Product if out of Stock! \n ${availableProduct.title}`
        );
      }

      // Total Amount
      totalAmount += Number(availableProduct.price * item.quantity);
    }
    res.json({
      message: "Checkout Summary!",
      currency: "INR",
      Amount: totalAmount,
      item: cartDetails.cart.length,
    });
  } catch (err) {
    next(err);
  }
});

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
checkoutRouter.post("/checkout/pay", userAuth, async (req, res, next) => {
  try {
    const user = req.user;

    const cartDetails = await userModel
      .findById(user._id.toString())
      .populate("cart.productId");

    if (!cartDetails.cart.length) {
      throw new Error("Cart is empty!");
    }

    let totalAmount = 0;
    const orderItems = [];

    // verifying each product and calculating total Amount
    for (const item of cartDetails.cart) {
      const availableProduct = item.productId;

      if (!availableProduct) {
        throw new Error("Product no longer Exists!");
      }

      // checking if stock is available or not
      if (availableProduct.stock < item.quantity) {
        throw new Error(
          `Product if out of Stock! \n ${availableProduct.title}`
        );
      }

      // Total Amount
      totalAmount += Number(availableProduct.price * item.quantity);

      orderItems.push({
        productId: availableProduct._id,
        quantity: item.quantity,
        priceAtPurchase: availableProduct.price,
      });
    }

    // Creating Order
    const newOrder = await orderModel.create({
      userId: user._id,
      items: orderItems,
      totalAmount: totalAmount,
      paymentStatus: "paid",
      orderStatus: "processing",
    });

    // Deducting stock for each product
    for (const item of cartDetails.cart) {
      await productModel.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // at the end clearing user cart
    cartDetails.cart = [];
    await cartDetails.save();

    res.json({
      message: "Payment successful! Order created.",
      order: newOrder,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = checkoutRouter;
