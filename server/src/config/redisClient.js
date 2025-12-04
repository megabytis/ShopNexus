require("dotenv").config();

const Redis = require("ioredis");

let redis;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10);

if (REDIS_HOST && REDIS_PORT) {
  const redisConfig = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
      // If redis is down, don't retry forever in development, or just return null to stop retrying
      if (times > 3) {
        console.log("Redis connection failed, disabling Redis client.");
        return null; 
      }
      return Math.min(times * 50, 2000);
    }
  };

  redis = new Redis(redisConfig);

  redis.on("connect", () => console.log("✅ Redis connected"));
  redis.on("ready", () => console.log("⚡ Redis ready for Commands"));
  redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
  });
  redis.on("end", () => console.log("🔴 Redis connection closed"));
} else {
  console.log("⚠️ Redis config missing, using mock client");
}

// Mock client if redis is not initialized or fails
if (!redis) {
  redis = {
    get: async () => null,
    set: async () => "OK",
    del: async () => 1,
    on: () => {},
    call: async () => null, 
  };
}

module.exports = { redis };
