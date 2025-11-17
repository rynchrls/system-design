import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { setCache, getCache, deleteCache } from "../utils/cache.utils.js";
import { convertToObjectId } from "../utils/convertToObjectId.util.js";
import crypto from "crypto";
import type { Order } from "../types/order.type.js";
import { REDIS } from "../config.js";

const redis = REDIS

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

      let cacheKey = `${namespace}:page=${page}:limit=${limit}`;

      if (filter !== "") {
        // Convert filter to a deterministic hash
        const filterHash = crypto.createHash("md5").update(JSON.stringify(filter)).digest("hex");
        cacheKey = cacheKey + `:filter=${filterHash}`;
      }

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
        await redis.expire(cacheKey, 60);
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
              items: [{ $sort: { _id: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }],
              totalCount: [{ $count: "count" }],
            },
          },
        ])
        .toArray();

      // Store in cache
      await setCache(cacheKey, collection[0], 60);

      // Remove existing instance of this key before re-adding
      await redis.lrem(listKey, 0, cacheKey);

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

  static async writeThrough(payload: Order) {
    try {
      // convert to object id
      payload._id = new ObjectId();
      payload.userId = convertToObjectId(payload.userId);

      // namespaces for cached page
      const cacheKey = `user:${payload.userId}:orders:page=1:limit=10`;

      // write to db
      const res = await this.collectionName("orders").insertOne(payload);

      // check if insert was successful
      if (!res.acknowledged) throw new Error("DB insert failed");

      // get current cache
      const cacheData = await getCache<any>(cacheKey);

      // update cache if exists
      if (cacheData?.items && Array.isArray(cacheData.items)) {
        const newOrder = { _id: res.insertedId, ...payload };

        const updatedItems = [newOrder, ...cacheData.items.slice(0, 9)];
        const updatedCache = {
          ...cacheData,
          items: updatedItems,
          totalCount: [{ count: (cacheData.totalCount?.[0]?.count || 0) + 1 }],
        };

        // set updated cache with a TTL of 1 minutes
        await setCache(cacheKey, updatedCache, 60);
        console.log(`🧠 Cache updated for key: ${cacheKey}`);
      }

      return res;
    } catch (error: any) {
      throw new Error(`WriteThrough failed: ${error.message}`);
    }
  }

  static async writeBehind(payload: Order) {
    try {
      const payloadWithId = { ...payload, _id: new ObjectId(), userId: payload.userId };

      // 1. Write directly to Redis (cached store)
      const cacheKey = `user:${payload.userId}:orders:page=1:limit=10`;
      const cacheData = await getCache<any>(cacheKey);

      if (cacheData?.items) {
        cacheData.items.unshift(payloadWithId);
        cacheData.items = cacheData.items.slice(0, 10);
        cacheData.totalCount[0].count += 1;
        await setCache(cacheKey, cacheData);
      } else {
        await setCache(cacheKey, { items: [payloadWithId], totalCount: [{ count: 1 }] });
      }

      console.log("⚡ Cached new order in Redis:", payloadWithId._id);

      // 2. Push write job to background queue for DB persistence
      await redis.lpush("write_behind_queue", JSON.stringify(payloadWithId));

      return {insertedId: payloadWithId._id, acknowledged: true };
    } catch (error: any) {
      throw new Error(`Write-Behind failed: ${error.message}`);
    }
  }
}
