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
    const existingItem = user.cart.find((item) => {
      return item.productId.toString() === productId.toString();
    });

    if (existingItem) {
      // if the item exists then add new quantity with old existing quantity
      existingItem.quantity += Number(quantity);
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

module.exports = cartRouter;
