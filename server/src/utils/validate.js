const validator = require("validator");

const validateSignupData = (req) => {
  const { name, email, password } = req.body;

  if (!name || String(name).trim().length < 2) {
    throw new Error("Name not valid!");
  }
  if (!email || !validator.isEmail(String(email))) {
    throw new Error("Email not valid!");
  }
  if (!password || !validator.isStrongPassword(String(password))) {
    throw new Error("Password is not strong!");
  }
};

const validateNewCategoriesData = (req) => {
  const { name } = req.body;
  if (!name || String(name).trim().length < 2) {
    throw new Error("Invalid Category name");
  }
};

const validateMongoID = (id) => {
  if (!id) {
    throw new Error("Invalid MongoID!");
  }
  if (!validator.isMongoId(String(id))) {
    throw new Error("Invalid MongoID!");
  }
};

const validateProductsData = (data) => {
  const { title, description, price, stock, image, category } = data;
  if (!title || String(title).trim().length < 1) {
    throw new Error("Invalid Title!");
  }
  if (!description || String(description).trim().length < 5) {
    throw new Error("Invalid Description!");
  }

  const p = Number(price);
  if (!Number.isFinite(p) || p < 0) {
    throw new Error("Invalid Price!");
  }

  const s = Number(stock);
  if (!Number.isInteger(s) || s < 0) {
    throw new Error("Invalid Stock!");
  }
  if (!image || !validator.isURL(String(image))) {
    throw new Error("Invalid Image URL!");
  }
  if (!category || !validator.isMongoId(String(category))) {
    throw new Error("Invalid Category ID!");
  }
};

const validateOrderStatus = (req) => {
  const { orderStatus } = req.body;

  const validOrderStatus = ["processing", "shipped", "delivered", "cancelled"];

  if (!orderStatus) {
    throw new Error("No status provided!");
  }
  if (!validOrderStatus.includes(String(orderStatus))) {
    throw new Error("Invalid Order Status!");
  }
};

module.exports = {
  validateSignupData,
  validateNewCategoriesData,
  validateMongoID,
  validateProductsData,
  validateOrderStatus,
};
