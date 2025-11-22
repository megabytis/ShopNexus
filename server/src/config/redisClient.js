const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_USERNAME = process.env.REDIS_USERNAME;

if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD || !REDIS_USERNAME) {
  throw new Error("Missing Redis Config: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_USERNAME required")
}

const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
};

// Creating Client
const Redis = require("ioredis");
const redis = new Redis(redisConfig);

// Events
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on('ready', () => console.log("⚡ Redis ready for Commands"))
redis.on("error", (err) => console.error("❌ Redis connection error:", err.message));
redis.on("end", () => console.log("🔴 Redis connection closed"));

module.exports = { redis };
