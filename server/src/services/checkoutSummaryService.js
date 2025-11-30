const { userModel } = require("../models/user");

async function getCheckoutSummary(userId) {
  if (!userId) {
    throw new Error("User ID missing! ");
  }

  const cartDetails = await userModel
    .findById(userId.toString())
    .select("cart")
    .populate("cart.productId");

  if (!cartDetails || !cartDetails.cart?.length) {
    return res.json({
      message: "Cart is Empty!",
      amount: 0,
      currency: "INR",
      totalItems: 0,
    });
  }

  // Filtering out items where product no longer exists
  const validItems = cartDetails.cart.filter((item) => item.productId);

  // If items were removed, update the cart
  if (validItems.length < cartDetails.cart.length) {
    cartDetails.cart = validItems;
    await cartDetails.save();
  }

  if (validItems.length === 0) {
    return res.json({
      message: "Cart is Empty (Invalid items removed)!",
      amount: 0,
      currency: "INR",
      totalItems: 0,
    });
  }

  // TOTALAMOUNT
  // verifying each product and calculating total Amount
  let totalAmount = 0;
  for (const item of validItems) {
    const availableProduct = item.productId;

    // checking if stock is available or not
    if (availableProduct.stock < item.quantity) {
      throw new Error(`Product is out of Stock! \n ${availableProduct.title}`);
    }

    // Total Amount
    totalAmount += Number(availableProduct.price * item.quantity);
  }

  return {
    message: "Checkout Summary!",
    amount: parseFloat(totalAmount.toFixed(2)),
    currency: "INR",
    totalItems: validItems.length,
  };
}

module.exports = {
  getCheckoutSummary,
};
