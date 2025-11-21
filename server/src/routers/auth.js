const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const { userModel } = require("../models/user");
const { validateSignupData } = require("../utils/validate");

const authRouter = express.Router();

const isProd = process.env.NODE_ENV === "production";

authRouter.post("/auth/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    validateSignupData(req);

    const isEmailAvailable = await userModel.findOne({ email: email });
    if (isEmailAvailable) {
      throw new Error("Email already Registered!");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const newUser = await user.save();

    res.json({
      message: `User added successfully`,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
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
      throw new Error("Invalid Credentials!");
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
        secure: true, // Always true for cross-site cookies
        sameSite: "none", // Required for cross-site cookies
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: "Successfully Logged-in",
        userData: {
          _id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
        },
      });
    } else {
      throw new Error("Invalid Credentials!");
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
  res.json({
    message: "Logged Out Successfully!",
  });
});

module.exports = authRouter;
