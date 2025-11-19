const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const { userModel } = require("../models/user");
const { validateSignupData } = require("../utils/validate");

const authRouter = express.Router();

authRouter.post("/auth/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const isEmailAvailable = await userModel.find({ email: email });
    if (!isEmailAvailable) {
      throw new Error("Email already Registered!");
    }

    validateSignupData(req);

    const hashedPassword = await bcrypt.hash(password, 10);

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

      const isProd = process.env.NODE_ENV === "production";
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
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
  res.json({
    message: "Logged Out Successfully!",
  });
});

module.exports = authRouter;
