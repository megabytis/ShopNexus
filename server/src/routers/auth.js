const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const { userModel } = require("../models/user");
const { sessionModel } = require("../models/sessionModel");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/tokenUtils");
const { validateSignupData } = require("../utils/validate");
const { userAuth } = require("../middleware/Auth");
const { authLimiter } = require("../utils/rateLimiter");

const authRouter = express.Router();

const isProd = process.env.NODE_ENV === "production";

authRouter.post("/auth/register", authLimiter, async (req, res, next) => {
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

authRouter.post("/auth/login", authLimiter, async (req, res, next) => {
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
      // Generate Tokens
      const accessToken = generateAccessToken(foundUser);
      const refreshToken = generateRefreshToken();
      const refreshTokenHash = hashToken(refreshToken);

      // Create Session
      const session = new sessionModel({
        userId: foundUser._id,
        refreshTokenHash,
        userAgent: req.headers["user-agent"] || "",
        ip: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      await session.save();

      // Set Refresh Token Cookie
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Also clear old token cookie if it exists to avoid confusion
      res.clearCookie("token");

      return res.json({
        message: "Successfully Logged-in",
        accessToken,
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

authRouter.post("/auth/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      const err = new Error("No Refresh Token");
      err.statusCode = 401;
      throw err;
    }

    const hashedRT = hashToken(refreshToken);
    const session = await sessionModel.findOne({
      refreshTokenHash: hashedRT,
      valid: true,
    });

    if (!session) {
      const err = new Error("Invalid Session");
      err.statusCode = 401;
      throw err;
    }

    if (new Date() > session.expiresAt) {
      const err = new Error("Session Expired");
      err.statusCode = 401;
      throw err;
    }

    const user = await userModel.findById(session.userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 401;
      throw err;
    }

    // Rotate Tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRefreshToken);

    // Update Session
    session.refreshTokenHash = newRefreshTokenHash;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();

    // Set New Cookie
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.clearCookie("refreshToken");
    next(err);
  }
});

authRouter.post("/auth/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const hashedRT = hashToken(refreshToken);
      await sessionModel.findOneAndUpdate(
        { refreshTokenHash: hashedRT },
        { valid: false }
      );
    }

    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
    });
    res.clearCookie("token"); // Clear legacy cookie

    res.json({
      message: "Logged Out Successfully!",
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/logout-all", userAuth, async (req, res, next) => {
  try {
    await sessionModel.updateMany({ userId: req.user._id }, { valid: false });

    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
    });
    res.clearCookie("token");

    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/auth/me", userAuth, (req, res) => {
  res.json({
    userData: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

module.exports = authRouter;
