import rateLimit, { Options } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
// @ts-ignore
import { Request, Response } from "express";

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

interface CreateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request | any, res?: Response) => string;
  prefix?: string;
}

// ------------------------------
// Base Limiter Factory
// ------------------------------
const createLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Try again later.",
  keyGenerator = (req: Request) => req.ip || "127.0.0.1",
  prefix,
}: CreateLimiterOptions) =>
  rateLimit({
    store: new RedisStore({
      // @ts-ignore
      sendCommand: (...args: any[]) => redisClient.call(...args),
      prefix: prefix || "rl:common:",
    }),
    windowMs,
    max,
    standardHeaders: "draft-6",
    legacyHeaders: false,
    message: { error: message },
    handler: (req: Request, res: Response) => {
      return res.status(429).json({ error: message });
    },
    keyGenerator,
  });

// ------------------------------
// Actual Limiters
// ------------------------------

// 1) AUTH LIMITER
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login/signup attempts. Try after 15 minutes.",
  prefix: "rl:auth:",
});

// 2) PUBLIC API LIMITER
export const publicApiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  prefix: "rl:public:",
});

// 3) SEARCH LIMITER
export const searchLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many searches. Try again later.",
  prefix: "rl:search:",
});

// 4) USER LIMITER (Auth Required)
// Key based on user ID (preferred) else fallback IP
export const userLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 200,
  keyGenerator: (req: any) =>
    req.user && req.user._id
      ? `user:${String(req.user._id)}`
      : req.ip || "127.0.0.1",
  prefix: "rl:user:",
});

// 5) WRITE LIMITER (User-Based)
export const writeLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many write operations. Try again later.",
  keyGenerator: (req: any) =>
    req.user && req.user._id
      ? `user:${String(req.user._id)}`
      : req.ip || "127.0.0.1",
  prefix: "rl:write:",
});
