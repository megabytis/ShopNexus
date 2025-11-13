const express = require("express");
const validator = require("validator");

const { userAuth } = require("../middleware/Auth");
const { validateMongoID } = require("../utils/validate");
const { productModel } = require("../models/product");
const { userModel } = require("../models/user");

const cartRouter = express.Router();

cartRouter.post("/cart/add", userAuth, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user;

    validateMongoID(productId);

    const isproductAvailable = await productModel.findById(productId);

    if (!isproductAvailable) {
      throw new Error("Invalid Product ID!");
    }

    if (!validator.isNumeric(quantity) || quantity < 1) {
      throw new Error("Invalid Quantity!");
    }

    //   Checking if product already exists in cart or not
    const existanceOfItemInCart = user.cart.find((item) => {
      return item.productId.toString() === productId.toString();
    });

    if (existanceOfItemInCart) {
      // if the item exists then add new quantity with old existing quantity
      existanceOfItemInCart.quantity += Number(quantity);
    } else {
      // if the item doesn't exist then push that new product to cart
      user.cart.push({
        productId: productId,
        quantity: quantity,
      });
    }

    await user.save();

    res.json({
      message: "Cart Updated Successfully!",
      cart: user.cart,
    });
  } catch (err) {
    next(err);
  }
});

cartRouter.put("/cart/update", userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    const { productId, newQuantity } = req.body;

    validateMongoID(productId);

    const isproductAvailable = await productModel.findById(productId);

    if (!isproductAvailable) {
      throw new Error("Invalid Product ID!");
    }

    if (!validator.isNumeric(newQuantity) || newQuantity < 1) {
      throw new Error("Invalid Quantity!");
    }

    if (user.cart.length === 0) {
      throw new Error("Cart is Empty!");
    }

    const existanceOfItemInCart = user.cart.find((item) => {
      return item.productId.toString() === productId.toString();
    });

    if (!existanceOfItemInCart) {
      throw new Error("Item doesn't exist in Cart!");
    }

    existanceOfItemInCart.quantity = newQuantity;

    await user.save();

    res.json({
      message: "Cart updated Successfully!",
      cart: user.cart,
    });
  } catch (err) {
    next(err);
  }
});

cartRouter.delete(
  "/cart/remove/:productId",
  userAuth,
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      const user = req.user;

      validateMongoID(productId);

      const existanceOfItemInCart = user.cart.find((item) => {
        return item.productId.toString() === productId.toString();
      });

      if (!existanceOfItemInCart) {
        throw new Error("Item doesn't exist in the Cart!");
      }

      user.cart = user.cart.filter((item) => {
        return item.productId.toString() !== productId;
      });

      await user.save();

      res.json({
        message: "Product Removed Successfully!",
        cart: user.cart,
      });
    } catch (err) {
      next(err);
    }
  }
);

cartRouter.get("/cart", userAuth, async (req, res, next) => {
  try {
    const user = req.user;

    const cartDetails = await userModel
      .findById(user._id)
      .select("cart")
      .populate("cart.productId");

    let totalAmount = 0.0;
    let totalItems = 0;
    let totalQuantity = 0;
    for (const items of cartDetails.cart) {
      totalAmount += Number(items.productId.price * items.quantity);
      totalItems++;
      totalQuantity += Number(items.quantity);
    }

    res.json({
      message: "Cart!",
      totalItems: totalItems,
      totalQuantity: totalQuantity,
      totalAmount: totalAmount,
      cart: cartDetails.cart,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = cartRouter;
