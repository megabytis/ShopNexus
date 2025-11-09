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
  if (!req.name) {
    throw new Error("Invalid Category name");
  }
};

module.exports = {
  validateSignupData,
  validateNewCategoriesData,
};
