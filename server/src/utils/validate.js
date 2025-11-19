const validator = require("validator");

const validateSignupData = (req) => {
  const { name, email, password, role, cart } = req.body;

  if (!name) {
    throw new Error("Name not valid!");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong!");
  }
};

const validateNewCategoriesData = (req) => {
  const { name } = req.body;
  if (!name || name.toString().length < 2) {
    throw new Error("Invalid Category name");
  }
};

const validateMongoID = (id) => {
  if (!id) {
    throw new Error("Invalid MongoID!");
  } else if (!validator.isMongoId(id.toString())) {
    throw new Error("Invalid MongoID!");
  }
};

const validateProductsData = (req) => {
  const { title, description, price, stock, image, category } = req.body;
  if (!title) {
    throw new Error("Invalid Title!");
  } else if (!description) {
    throw new Error("Invalid Description!");
  } else if (!validator.isNumeric(price) || !price) {
    throw new Error("Invalid Price!");
  } else if (!validator.isNumeric(stock)) {
    throw new Error("Invalid Stock!");
  } else if (!validator.isURL(image)) {
    throw new Error("Invalid Image URL!");
  } else if (!validator.isMongoId(category)) {
    throw new Error("Invalid MongoID!");
  }
};

const validateOrderStatus = (req) => {
  const { orderStatus } = req.body;

  const validOrderStatus = ["processing", "shipped", "delivered", "cancelled"];

  if (!orderStatus) {
    throw new Error("No status has given!");
  } else if (!validOrderStatus.includes(orderStatus)) {
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
