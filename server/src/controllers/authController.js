const validator = require("validator");
const bcrypt = require("bcrypt");

const { validateSignupData } = require("../utils/validate");
const { userModel } = require("../models/user");
const { sessionModel } = require("../models/session");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/token");

const isProd = process.env.NODE_ENV === "production";

async function registerNewUser(req, res, next) {
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
}

async function login(req, res, next) {
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
        message: "Successfully Logged-in",
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
}

async function refresh(req, res, next) {
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
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      partitioned: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.clearCookie("refreshToken");
    next(err);
  }
}

async function logout(req, res, next) {
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
    res.clearCookie("token"); // Clear legacy cookie

    res.json({
      message: "Logged Out Successfully!",
    });
  } catch (err) {
    next(err);
  }
}

async function logoutAll(req, res, next) {
  try {
    await sessionModel.updateMany({ userId: req.user._id }, { valid: false });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      partitioned: true,
      path: "/",
    });
    res.clearCookie("token");

    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    next(err);
  }
}

function self(req, res) {
  res.json({
    userData: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

module.exports = {
  registerNewUser,
  login,
  refresh,
  logout,
  logoutAll,
  self,
};
