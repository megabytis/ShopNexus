const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { userLimiter } = require("../utils/rateLimiter");

const {
  addProduct,
  updateProduct,
  deleteProduct,
  showCart,
  clearCart,
} = require("../controllers/cartController");

const cartRouter = express.Router();

cartRouter.post("/cart/add", userAuth, addProduct);

cartRouter.put("/cart/update", userAuth, updateProduct);

cartRouter.delete("/cart/remove/:productId", userAuth, deleteProduct);

cartRouter.delete("/cart/clear", userAuth, clearCart);

cartRouter.get("/cart", userAuth, userLimiter, showCart);

module.exports = cartRouter;
