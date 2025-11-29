const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");
const { ipKeyGenerator } = require("express-rate-limit");

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

// ------------------------------
// Base Limiter Factory
// ------------------------------
const createLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Try again later.",
  keyGenerator = (req) => ipKeyGenerator(req),
  prefix,
}) =>
  rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: prefix || "rl:common:",
    }),
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    standardHeaders: "draft-6",
    message: { error: message },
    handler: (req, res) => {
      return res.status(429).json({ error: message });
    },
    keyGenerator,
  });

// ------------------------------
// Actual Limiters
// ------------------------------

// 1) AUTH LIMITER
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login/signup attempts. Try after 15 minutes.",
  prefix: "rl:auth:",
});

// 2) PUBLIC API LIMITER
const publicApiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  prefix: "rl:public:",
});

// 3) SEARCH LIMITER
const searchLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many searches. Try again later.",
  prefix: "rl:search:",
});

// 4) USER LIMITER (Auth Required)
// Key based on user ID (preferred) else fallback IP
const userLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 200,
  keyGenerator: (req) =>
    req.user && req.user._id ? `user:${String(req.user._id)}` : req.ip,
  prefix: "rl:user:",
});

// 5) WRITE LIMITER (User-Based)
const writeLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many write operations. Try again later.",
  keyGenerator: (req) =>
    req.user && req.user._id ? `user:${String(req.user._id)}` : req.ip,
  prefix: "rl:write:",
});

module.exports = {
  authLimiter,
  publicApiLimiter,
  searchLimiter,
  userLimiter,
  writeLimiter,
};
