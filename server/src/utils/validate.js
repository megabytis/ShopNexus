const validator = require("validator");

const validateSignupData = (req) => {
  const { name, email, password, role, cart } = req.body;

  if (!name) {
    throw new Error("Name not valid!");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong!");
  } else if (!role) {
    throw new Error("Role has not provided!");
  } else if (
    !(
      validator.matches(role.toString(), "user") ||
      validator.matches(role.toString(), "admin")
    )
  ) {
    throw new Error("Not a valid role type!");
  } else if (cart) {
    if (cart[0].length > 0) {
      if (!validator.isMongoId(cart[0].productId)) {
        throw new Error("Invalid productID");
      } else if (cart[0].quantity < 1) {
        throw new Error("Insufficient order Quantity!");
      }
    }
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

module.exports = {
  validateSignupData,
  validateNewCategoriesData,
  validateMongoID,
  validateProductsData,
};
