const { redis } = require("../config/redisClient");

const setCache = async (key, value, ttl = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    console.error("Error setting cache:", error);
  }
};

const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting cache:", error);
    return null;
  }
};

const removeCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Error removing cache:", error);
  }
};

module.exports = { setCache, getCache, removeCache };
