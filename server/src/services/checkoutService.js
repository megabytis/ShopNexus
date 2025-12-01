const { userModel } = require("../models/user");

async function processOrder(user, shippingAddress) {
  if (!user || !user._id) {
    throw new Error("User not found!");
  }

  const cartDetails = await userModel
    .findById(user._id.toString())
    .populate("cart.productId");

  if (!cartDetails.cart.length) {
    throw new Error("Cart is empty!");
  }

  if (
    !shippingAddress ||
    !shippingAddress.fullName?.trim() ||
    !shippingAddress.addressLine1?.trim() ||
    !shippingAddress.city?.trim() ||
    !shippingAddress.state?.trim() ||
    !shippingAddress.postalCode?.trim() ||
    !shippingAddress.country?.trim()
  ) {
    throw new Error("Please provide a complete shipping address!");
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
      throw new Error(`Product if out of Stock! \n ${availableProduct.title}`);
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
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    paymentStatus: "paid",
    orderStatus: "processing",
    shippingAddress,
  });

  // Deducting stock for each product
  for (const item of cartDetails.cart) {
    const result = await productModel.updateOne(
      {
        _id: item.productId._id,
        stock: { $gte: item.quantity },
      },
      {
        $inc: { stock: -item.quantity },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error(
        `Stock changed! Only ${item.productId.stock} left for ${item.productId.title}`
      );
    }
  }

  // at the end clearing user cart
  cartDetails.cart = [];
  await cartDetails.save();
}

module.exports = {
  processOrder,
};
