const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const { userModel } = require("../models/user");
const { validateSignupData } = require("../utils/validate");

const authRouter = express.Router();

authRouter.post("/auth/signup", async (req, res, next) => {
  try {
    const { name, email, password, role, cart } = req.body;

    validateSignupData(req);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      cart: cart,
    });

    const newUser = await user.save();

    res.json({
      message: `User added successfully`,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        cart: newUser.cart,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      throw new Error("Invalid Credentials!");
    }

    const foundUser = await userModel.findOne({ email: email });
    if (!foundUser) {
      throw new Error("Invalid Crential!");
    }

    const isPassSame = await bcrypt.compare(password, foundUser.password);

    if (isPassSame) {
      const token = jwt.sign(
        {
          _id: foundUser._id,
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Successfully Logged-in",
        userData: {
          _id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
        },
      });
    } else {
      throw new Error("Invalid Credential!");
    }
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/logout", async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
});

module.exports = authRouter;
