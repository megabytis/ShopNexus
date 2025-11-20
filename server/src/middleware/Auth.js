const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Invalid Token!");
    }

    const foundUserObj = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const foundUser = await userModel.findById(foundUserObj._id);

    if (!foundUser) {
      const err = new Error("User not found!");
      err.statusCode = 401;
      throw err;
    }

    req.user = foundUser;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  userAuth,
};
