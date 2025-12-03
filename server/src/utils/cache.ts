import { redis } from "../config/redisClient";

export const setCache = async (key: string, value: any, ttl: number = 3600): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    console.error("Error setting cache:", error);
  }
};

export const getCache = async (key: string): Promise<any> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting cache:", error);
    return null;
  }
};

export const removeCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Error removing cache:", error);
  }
};
