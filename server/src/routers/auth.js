const express = require("express");

const { userAuth } = require("../middleware/Auth");
const { authLimiter } = require("../utils/rateLimiter");
const {
  registerNewUser,
  login,
  refresh,
  logout,
  logoutAll,
  self,
} = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/auth/register", authLimiter, registerNewUser);

authRouter.post("/auth/login", authLimiter, login);

authRouter.post("/auth/refresh", refresh);

authRouter.post("/auth/logout", logout);

authRouter.post("/auth/logout-all", userAuth, logoutAll);

authRouter.get("/auth/me", userAuth, self);

module.exports = authRouter;
