const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { validateProductsData } = require("../utils/validate");
const { productModel } = require("../models/product");
const { categoriesModel } = require("../models/category");

const productsRouter = express.Router();

productsRouter.post("/products", userAuth, async (req, res, next) => {
  try {
    const { title, description, price, stock, image, category } = req.body;

    validateProductsData(req);

    const isAdmin = req.user.role === "admin" ? true : false;
    if (!isAdmin) {
      throw new Error("You aren't Authorized to add products!");
    }

    const isSameTitleAvailable = await productModel.findOne({ title: title });

    if (isSameTitleAvailable) {
      throw new Error("Duplicate Title not Allowed!");
    }

    const isValidCategory = await categoriesModel.findOne({ _id: category });

    if (!isValidCategory) {
      throw new Error("Invalid Category!");
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

productsRouter.get("/products", userAuth, async (req, res, next) => {
  //
});

module.exports = productsRouter;
