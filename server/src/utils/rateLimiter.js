const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try after 15 minutes." },
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many login attempts. Try after 15 minutes." });
  },
  keyGenerator: (req) => req.ip,
  draft_polli_ratelimit_headers: true,
});

const publicApiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again later." },
  handler: (req, res) => {
    res.status(429).json({ error: "Too many requests. Try again later." });
  },
  keyGenerator: (req) => req.ip,
  draft_polli_ratelimit_headers: true,
});

const searchLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many searches. Search again later." },
  handler: (req, res) => {
    res.status(429).json({ error: "Too many searches. Search again later." });
  },
  keyGenerator: (req) => req.ip,
  draft_polli_ratelimit_headers: true,
});

const userLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `user:${String(req.user._id)}`;
    } else {
      return req.ip;
    }
  },
  draft_polli_ratelimit_headers: true,
});

const writeLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many edits. Do it again later." },
  handler: (req, res) => {
    res.status(429).json({ error: "Too many edits. Do it again later." });
  },
  keyGenerator: (req) => req.ip,
  draft_polli_ratelimit_headers: true,
});

module.exports = {
  authLimiter,
  publicApiLimiter,
  searchLimiter,
  userLimiter,
  writeLimiter,
};
