const express = require("express");
const validator = require("validator");

const { userAuth } = require("../middleware/Auth");
const { validateMongoID } = require("../utils/validate");
const { productModel } = require("../models/product");

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
      messege: "Cart Updated Successfully!",
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
      messege: "Cart updated Successfully!",
      cart: user.cart,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = cartRouter;
