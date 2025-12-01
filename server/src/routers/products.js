const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { publicApiLimiter, searchLimiter } = require("../utils/rateLimiter");
const { authorize } = require("../middleware/Role");
const {
  addProduct,
  viewProducts,
  viewProductsById,
  updateProductsById,
  deleteProductById,
} = require("../controllers/productController");

const productsRouter = express.Router();

productsRouter.post("/products", userAuth, authorize("admin"), addProduct);

// GET /products with multiple filters
productsRouter.get("/products", publicApiLimiter, searchLimiter, viewProducts);

/*
What GET /products have :-
- finding all products and selecting specific categories to show 
- populating category, cuz product have taken reference of category, so it will populate about it's specified category in detail
- in response it will show also total number of products listed along with product details and a sweet message :) 
*/

productsRouter.get("/products/:id", publicApiLimiter, viewProductsById);

productsRouter.put(
  "/products/:id",
  userAuth,
  authorize("admin"),
  updateProductsById
);

productsRouter.delete("/products/:id", userAuth, deleteProductById);

module.exports = productsRouter;
