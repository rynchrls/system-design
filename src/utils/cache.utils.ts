import RedisClient from '../config/redis.js';

const redis = new RedisClient().redis;

export const setCache = async (key: string, data: any, ttlSeconds = 60) => {
  const jsonData = JSON.stringify(data);
  await redis.set(key, jsonData, "EX", ttlSeconds);
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const result = await redis.get(key);
  return result ? (JSON.parse(result) as T) : null;
};

export const deleteCache = async (key: string) => {
  await redis.del(key);
};
