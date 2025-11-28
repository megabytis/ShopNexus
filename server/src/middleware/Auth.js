const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const err = new Error("Please Authenticate!");
      err.statusCode = 401;
      throw err;
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
    if (err.name === "TokenExpiredError") {
      err.statusCode = 401;
      err.message = "Token Expired";
    } else if (err.name === "JsonWebTokenError") {
      err.statusCode = 401;
      err.message = "Invalid Token";
    }
    next(err);
  }
};

module.exports = {
  userAuth,
};
