const { productModel } = require("../models/product");
const { userModel } = require("../models/user");
const { validateMongoID } = require("../utils/validate");

async function addToCart(user, productId, quantity) {
  if (!productId) {
    throw new Error("Product ID not found!");
  }
  validateMongoID(productId);

  const availableProduct = await productModel.findById(productId);

  if (!availableProduct) {
    throw new Error("Invalid Product ID!");
  }

  const qty = Number(quantity);
  if (!qty || qty < 1 || !Number.isInteger(qty)) {
    throw new Error("Invalid Quantity!");
  }

  //   Checking if product already exists in cart or not
  const existingItem = user.cart.find((item) => {
    return item.productId.toString() === productId.toString();
  });

  // checking wheather product is Out-Of-Stock
  if (availableProduct.stock < 1) {
    throw new Error("Product is Out of stock!");
  }
  if (qty > availableProduct.stock) {
    throw new Error(
      `Only ${availableProduct.stock} items available in stock. You requested ${qty}.`
    );
  }

  if (existingItem) {
    // if the item exists then add new quantity with old existing quantity
    existingItem.quantity += qty;
  } else {
    // if the item doesn't exist then push that new product to cart
    user.cart.push({
      productId,
      quantity: qty,
    });
  }

  await user.save();

  return user.cart;
}

async function updateCart(user, productId, quantity) {
  if (!productId) {
    throw new Error("Product ID not found!");
  }
  validateMongoID(productId);

  const availableProduct = await productModel.findById(productId);

  if (!availableProduct) {
    throw new Error("Invalid Product ID!");
  }

  const newQty = Number(quantity);
  if (!newQty || newQty < 1 || !Number.isInteger(newQty)) {
    throw new Error("Invalid Quantity!");
  }

  if (newQty > availableProduct.stock) {
    throw new Error(
      `Only ${availableProduct.stock} items available in stock. You requested ${newQty}.`
    );
  }

  if (user.cart.length === 0) {
    throw new Error("Cart is Empty!");
  }

  const existingItem = user.cart.find((item) => {
    return item.productId.toString() === productId.toString();
  });

  if (!existingItem) {
    throw new Error("Item doesn't exist in Cart!");
  }

  existingItem.quantity = newQty;

  await user.save();

  return user.cart;
}

async function deleteCartProduct(user, productId) {
  if (!productId) {
    throw new Error("Product ID not found!");
  }
  validateMongoID(productId);

  const existingItem = user.cart.find((item) => {
    return item.productId.toString() === productId.toString();
  });

  if (!existingItem) {
    throw new Error("Item doesn't exist in the Cart!");
  }

  user.cart = user.cart.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });

  await user.save();

  return user.cart;
}

async function getCart(userId) {
  if (!userId) {
    throw new Error("UserID not found!");
  }
  validateMongoID(userId);

  const cartDetails = await userModel
    .findById(userId)
    .select("cart")
    .populate("cart.productId");

  if (!cartDetails?.cart?.length) {
    return {
      message: "Cart is Empty!",
      totalItems: 0,
      totalQuantity: 0,
      totalAmount: 0,
      cart: [],
    };
  }

  // filtering out deleted products
  const validCartItems = cartDetails.cart.filter((item) => {
    if (!item?.productId || item.productId.price === undefined) {
      return false;
    }
    return true;
  });

  let totalAmount = 0.0;
  let totalItems = 0;
  let totalQuantity = 0;

  // calculating totals of valid items only
  for (const items of validCartItems) {
    totalAmount += Number(items.productId.price * items.quantity);
    totalItems++;
    totalQuantity += Number(items.quantity);
  }

  // updating user's cart if there were deleted products
  if (validCartItems.length !== cartDetails.cart.length) {
    await userModel.findByIdAndUpdate(
      userId,
      { cart: validCartItems },
      { new: true }
    );
  }

  return {
    message:
      validCartItems.length < cartDetails.cart.length
        ? "Cart loaded (some unavailable items were removed)!"
        : "Cart",
    totalItems: Number(totalItems),
    totalQuantity: Number(totalQuantity),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    removedCartItems: cartDetails.cart.length - validCartItems.length,
    cart: validCartItems,
  };
}

module.exports = {
  addToCart,
  updateCart,
  deleteCartProduct,
  getCart,
};
