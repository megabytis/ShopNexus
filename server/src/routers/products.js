const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { validateProductsData, validateMongoID } = require("../utils/validate");
const { productModel } = require("../models/product");
const { categoriesModel } = require("../models/category");
const { buildKey } = require("../utils/keyGenerator");
const { getCache, setCache, removeCache } = require("../utils/cache");
const { publicApiLimiter, searchLimiter } = require("../utils/rateLimiter");
const { authorize } = require("../middleware/Role");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../services/productService");

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

      const key = buildKey("product:details", { id });
      const cachedProducts = await getCache(key);
      if (cachedProducts) {
        return res.json(cachedProducts);
      }

      const product = await getProductById(id);

      await setCache(key, foundProduct, 60);

      return res.json({
        message: "Product Found Successfully!",
        product,
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
      const product = await updateProduct(req.params.id, req.body);

      await removeCache(buildKey("product:details", { id }));

      return res.json({
        message: "Product Updated Successfully!",
        product: product,
      });
    } catch (err) {
      next(err);
    }
  }
);

productsRouter.delete("/products/:id", userAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await deleteProduct(id);

    await removeCache(buildKey("product:details", { id }));

    return res.json({
      message: "Product deleted Successfully!",
      product: product,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = productsRouter;
