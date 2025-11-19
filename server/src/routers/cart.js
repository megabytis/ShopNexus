const express = require("express");
3;
2;
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

    const availableProduct = await productModel.findById(productId);

    if (!availableProduct) {
      throw new Error("Invalid Product ID!");
    }

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      throw new Error("Invalid Quantity!");
    }

    //   Checking if product already exists in cart or not
    const existanceOfItemInCart = user.cart.find((item) => {
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

    const availableProduct = await productModel.findById(productId);

    if (!availableProduct) {
      throw new Error("Invalid Product ID!");
    }

    const nqty = Number(newQuantity);
    if (!nqty || nqty < 1) {
      throw new Error("Invalid Quantity!");
    }

    if (!nqty > availableProduct.stock) {
      throw new Error(
        `Only ${availableProduct.stock} items available in stock. You requested ${nqty}.`
      );
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
        return item.productId.toString() !== productId.toString();
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

    if (!cartDetails?.cart?.length) {
      return res.json({
        message: "Cart is Empty!",
        totalItems: 0,
        totalQuantity: 0,
        totalAmount: 0,
        cart: [],
      });
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
        user._id,
        { cart: validCartItems },
        { new: true }
      );
    }

    res.json({
      message:
        validCartItems.length < cartDetails.cart.length
          ? "Cart loaded (some unavailable items were removed)!"
          : "Cart",
      totalItems: Number(totalItems),
      totalQuantity: Number(totalQuantity),
      totalAmount: Number(totalAmount),
      removedCartItems: cartDetails.cart.length - validCartItems.length,
      cart: validCartItems,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = cartRouter;
