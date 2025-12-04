const {
  addToCart,
  updateCart,
  deleteCartProduct,
  getCart,
} = require("../services/cartService");

async function addProduct(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const user = req.user;

    const cart = await addToCart(user, productId, quantity);

    return res.json({
      message: "Cart Updated Successfully!",
      cart,
    });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const user = req.user;
    const { productId, quantity } = req.body;

    const cart = await updateCart(user, productId, quantity);

    return res.json({
      message: "Cart updated Successfully!",
      cart,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const user = req.user;

    const cart = await deleteCartProduct(user, productId);

    return res.json({
      message: "Product Removed Successfully!",
      cart: cart,
    });
  } catch (err) {
    next(err);
  }
}

async function showCart(req, res, next) {
  try {
    const user = req.user;

    const cart = await getCart(user._id);

    res.json(cart);
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    const user = req.user;
    
    user.cart = [];
    await user.save();

    return res.json({
      message: "Cart cleared successfully!",
      cart: [],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  showCart,
  clearCart,
};
