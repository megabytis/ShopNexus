const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { validateProductsData, validateMongoID } = require("../utils/validate");
const { productModel } = require("../models/product");
const { categoriesModel } = require("../models/category");
const { buildKey } = require("../utils/keyGenerator");
const { getCache, setCache, removeCache } = require("../utils/cache");
const { publicApiLimiter, searchLimiter } = require("../utils/rateLimiter");
const { authorize } = require("../middleware/Role");
const { createProduct, getProducts } = require("../services/productService");

const productsRouter = express.Router();

productsRouter.post(
  "/products",
  userAuth,
  authorize("admin"),
  async (req, res, next) => {
    try {
      validateProductsData(req);

      const product = await createProduct(req.body);

      await removeCache(buildKey("products:list"));

      return res.json({
        message: "Product created successfully!",
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /products with multiple filters
productsRouter.get(
  "/products",
  publicApiLimiter,
  searchLimiter,
  async (req, res, next) => {
    try {
      let {
        category,
        minPrice,
        maxPrice,
        min,
        max,
        page = 1,
        limit = 12,
        sortBy = "createdAt",
        search,
      } = req.query;

      const filters = req.query;
      const filteredProducts = (await getProducts(filters)).products;

      // Adding Redis Caching
      const key = buildKey("products:list", {
        page,
        limit,
        sortBy,
        min: minPrice || 0,
        max: maxPrice || 99999,
        category,
        search: search || "none",
      });

      const cachedProducts = await getCache(key);
      if (cachedProducts) {
        return res.json(cachedProducts);
      }

      const Total = (await getProducts(filters)).total;
      const responseData = {
        message: "Filtered Products!",
        totalProducts: Total,
        totalPages: Math.ceil(Total / limit),
        page: Number(page),
        limit: Number(limit),
        products: filteredProducts,
      };

      await setCache(key, responseData, 60);

      return res.json(responseData);
    } catch (err) {
      next(err);
    }
  }
);

/*
What GET /products have :-
- finding all products and selecting specific categories to show 
- populating category, cuz product have taken reference of category, so it will populate about it's specified category in detail
- in response it will show also total number of products listed along with product details and a sweet message :) 
*/

productsRouter.get(
  "/products/:id",
  publicApiLimiter,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      validateMongoID(id);

      const key = buildKey("product:details", { id });
      const cachedProducts = await getCache(key);
      if (cachedProducts) {
        return res.json(cachedProducts);
      }

      const foundProduct = await productModel
        .findById(id)
        .select("title description price stock image category")
        .populate("category");

      if (!foundProduct) {
        throw new Error("Invalid Product ID!");
      }

      await setCache(key, foundProduct, 60);

      return res.json({
        message: "Product Found Successfully!",
        product: foundProduct,
      });
    } catch (err) {
      next(err);
    }
  }
);

productsRouter.put(
  "/products/:id",
  userAuth,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { title, description, price, stock, image, category } = req.body;

      const { id } = req.params;
      validateMongoID(id);
      validateProductsData(req);

      // Checking if another product already has this title
      const existingProduct = await productModel.findOne({ title: title });
      if (existingProduct && existingProduct._id.toString() !== id) {
        throw new Error("Duplicate Title not Allowed!");
      }

      const isValidCategory = await categoriesModel.findOne({ _id: category });
      if (!isValidCategory) {
        throw new Error("Category not found!");
      }

      await removeCache(buildKey("product:details", { id }));

      const foundProduct = await productModel.findByIdAndUpdate(
        id,
        {
          title: title,
          description: description,
          price: Number(price),
          stock: Number(stock),
          image: image,
          category: category,
        },
        { new: true, runValidators: true }
      );

      return res.json({
        message: "Product Updated Successfully!",
        product: foundProduct,
      });
    } catch (err) {
      next(err);
    }
  }
);

productsRouter.delete("/products/:id", userAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    validateMongoID(id);

    const foundProduct = await productModel.findByIdAndDelete(id);

    await removeCache(buildKey("product:details", { id }));

    return res.json({
      message: "Product deleted Successfully!",
      product: foundProduct,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = productsRouter;
