const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");

const { userModel } = require("../../models/user");
const { sessionModel } = require("../../models/session");
const { authLimiter } = require("../../utils/rateLimiter");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../../utils/token");

const adminAuthRouter = express.Router();
const isProd = process.env.NODE_ENV === "production";

// Admin Login
adminAuthRouter.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      throw new Error("Invalid Credentials!");
    }

    const foundUser = await userModel.findOne({ email: email });
    if (!foundUser) {
      throw new Error("Invalid Credentials!");
    }

    // Check if user is admin
    if (foundUser.role !== "admin") {
      const err = new Error("Access denied. Admin privileges required.");
      err.statusCode = 403;
      throw err;
    }

    const isPassSame = await bcrypt.compare(password, foundUser.password);

    if (isPassSame) {
      const accessToken = generateAccessToken(foundUser);
      const refreshToken = generateRefreshToken();
      const refreshTokenHash = hashToken(refreshToken);

      const session = new sessionModel({
        userId: foundUser._id,
        refreshTokenHash,
        userAgent: req.headers["user-agent"] || "",
        ip: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      await session.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        partitioned: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.clearCookie("token");

      return res.json({
        message: "Admin login successful",
        accessToken,
        user: {
          _id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
        },
      });
    } else {
      throw new Error("Invalid Credentials!");
    }
  } catch (err) {
    next(err);
  }
});

// Admin Logout
adminAuthRouter.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const hashedRT = hashToken(refreshToken);
      await sessionModel.findOneAndUpdate(
        { refreshTokenHash: hashedRT },
        { valid: false }
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      partitioned: true,
      path: "/",
    });
    res.clearCookie("token");

    res.json({
      message: "Admin logged out successfully!",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = adminAuthRouter;
