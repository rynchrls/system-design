import type { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { setCache, getCache, deleteCache } from "../utils/cache.utils.js";
import { convertToObjectId } from "../utils/convertToObjectId.util.js";
import crypto from "crypto";
import redisClient from "../config/redis.js";

const redis = new redisClient().redis;

export default class RedisRepo {
  static collection() {
    return getDB().collection("users");
  }

  static collectionName(name: string) {
    return getDB().collection(name);
  }

  static async getCache() {
    try {
      return "test";
    } catch (error: any) {
      return error.message;
    }
  }

  // 🧩 Cache-Aside (Lazy Loading)
  static async cacheAside(
    userId: string | ObjectId,
    { page = 1, limit = 10, filter }: { page: number; limit: number; filter?: any },
  ) {
    try {
      userId = convertToObjectId(userId);
      const namespace = `user:${userId}:orders`;
      // Convert filter to a deterministic hash
      const filterHash = crypto.createHash("md5").update(JSON.stringify(filter)).digest("hex");
      const cacheKey = `${namespace}:page=${page}:limit=${limit}:filter=${filterHash}`;

      //   primary query
      const query = {
        userId,
      };

      //   filter query
      let filterQuery = {};
      if (filter !== "") {
        filterQuery = { productId: { $gte: parseInt(filter) } };
      }

      //   list key to track recent cache keys
      const listKey = `${namespace}:list`;

      // Try to get cached data
      const cachedData = await getCache<any>(cacheKey);

      // 👀 Show current cache keys for this user
      const allKeys = await redis.lrange(listKey, 0, -1);
      console.log(`📜 Current cache list (${allKeys.length}):`, allKeys);

      // Cache hit
      if (cachedData) {
        console.log("⚡ Cache hit:", cacheKey);
        await redis.expire(cacheKey, 300);
        return cachedData;
      }

      // Cache miss: query DB
      const collection = await this.collectionName("orders")
        .aggregate([
          {
            $match: {
              ...query,
              ...filterQuery,
            },
          },
          {
            $facet: {
              items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
              totalCount: [{ $count: "count" }],
            },
          },
        ])
        .toArray();

      // Store in cache
      await setCache(cacheKey, collection, 60);

      // Push to list of recent cache keys
      await redis.lpush(listKey, cacheKey);

      // Trim list to keep only 10 keys
      await redis.ltrim(listKey, 0, 9);

      // Get keys that were trimmed out (older ones) -- THIS IS OPTIONAL CLEAN UP
      //   const oldKeys = await redis.lrange(listKey, 10, -1);
      //   if (oldKeys.length > 0) {
      //     await redis.del(...oldKeys);
      //   }

      return collection[0];
    } catch (error: any) {
      return error.message;
    }
  }
}
