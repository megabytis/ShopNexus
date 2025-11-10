const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { validateProductsData } = require("../utils/validate");
const { productModel } = require("../models/product");

const productsRouter = express.Router();

productsRouter.post("/products", userAuth, async (req, res, next) => {
  try {
    const { title, description, price, stock, image, category } = req.body;

    validateProductsData(req);

    const isSameTitleAvailable = await productModel.find({ title: title });

    if (isSameTitleAvailable) {
      throw new Error("Duplicate Title not Allowed!");
    }

    const products = new productModel({
      title: title,
      description: description,
      price: price,
      stock: stock,
      image: image,
      category: category,
    });

    const savedProducts = await products.save();

    res.json({
      messege: "Products",
      data: savedProducts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = productsRouter;
