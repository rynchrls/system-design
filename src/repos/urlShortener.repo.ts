import { ObjectId, type Document } from "mongodb";
import { getDB } from "../config/database.js";
import { ShortUrl, type IShortUrl } from "../models/urlShortener.model.js";
import { randomShortCodeNode } from "../utils/randomShortcode.util.js";
import { getCache, setCache } from "../utils/cache.utils.js";
import RedisClient from "../config/redis.js";

const redis = new RedisClient().redis;

export class UrlShortnerRepo {
  static collection() {
    return getDB().collection("short-code");
  }

  static collectionName(name: string) {
    return getDB().collection(name);
  }

  static createIndexes() {
    const col = getDB().collection("short-code");

    // 1️⃣ Unique shortCode
    col.createIndex({ shortCode: 1 }, { unique: true });

    // 2️⃣ TTL for expiry
    col.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

    // 3️⃣ Compound for owner’s dashboard
    col.createIndex({ ownerId: 1, updatedAt: -1 });

    // 4️⃣ Optional: for analytics ("most popular links")
    col.createIndex({ clicks: -1 });

    // 5️⃣ Optional: to find by original URL
    col.createIndex({ originalUrl: 1 });

    // 6️⃣ Optional: text search on title
    col.createIndex({ title: "text" });
  }

  static async createShortURl(shortCodeDetails: IShortUrl, maxRetries = 3): Promise<Document> {
    try {
      shortCodeDetails.shortCode = randomShortCodeNode(6);
      shortCodeDetails.createdAt = new Date();
      shortCodeDetails.updatedAt = new Date();
      shortCodeDetails._id = new ObjectId();
      // shortCodeDetails.expireAt = new Date();
      shortCodeDetails.clicks = 0;

      const data = new ShortUrl({ ...shortCodeDetails });

      console.log(data);
      // namespaces for cached page
      const cacheKey = `user:${shortCodeDetails.shortCode}:shortCode`;

      const insert = await this.collection().insertOne(data);

      // check if insert was successful
      if (!insert.acknowledged) throw new Error("DB insert failed");

      // set updated cache with a TTL of 1 minutes
      await setCache(cacheKey, shortCodeDetails, 60);
      console.log(`🧠 Cache updated for key: ${cacheKey}`);

      return insert;
    } catch (error: any) {
      // Retry only if it's a duplicate key
      if (error.code === 11000 && maxRetries > 0) {
        console.warn(`Duplicate shortCode, retrying... attempts left: ${maxRetries - 1}`);
        return await this.createShortURl(shortCodeDetails, maxRetries - 1);
      }
      // Otherwise, fail fast
      throw new Error(error.message || "Failed to create short URL");
    }
  }

  // static async getOriginalUrl(shortCode: string) {
  //   try {
  //     const cacheKey = `user:${shortCode}:shortCode`;

  //     // Try to get cached data
  //     const cachedData = await getCache<any>(cacheKey);

  //     // Cache hit
  //     if (cachedData) {
  //       console.log("⚡ Cache hit:", cacheKey);
  //       cachedData.clicks += 1;
  //       // 2. Push write job to background queue for DB persistence
  //       await redis.lpush("write_behind_shortCode_queue", JSON.stringify(shortCode));
  //       return cachedData;
  //     }

  //     const updatedDoc = await this.collection().findOneAndUpdate(
  //       { shortCode },
  //       {
  //         $inc: { clicks: 1 },
  //         $set: { updatedAt: new Date() }, // optional but recommended
  //       },
  //       {
  //         returnDocument: "after", // ✅ return the updated doc
  //       },
  //     );
  //     await setCache(cacheKey, updatedDoc, 300);
  //     return updatedDoc;
  //   } catch (error: any) {
  //     throw new Error(error.message);
  //   }
  // }

  static async getOriginalUrl(shortCode: string) {
    try {
      const cacheKey = `user:${shortCode}:shortCode`;
      const counterKey = `clicks:${shortCode}`; // 🔹 new: Redis counter key

      // 1️⃣ Try to get cached short URL
      const cachedData = await getCache<any>(cacheKey);

      if (cachedData) {
        console.log("⚡ Cache hit:", cacheKey);

        // Increment counter atomically in Redis
        await redis.incr(counterKey);

        // Optionally, update the cached value for temporary consistency
        cachedData.clicks += 1;
        await setCache(cacheKey, cachedData, 60);

        return cachedData;
      }

      // 2️⃣ Cache miss → get from MongoDB and increment counter
      const doc = await this.collection().findOne({ shortCode });

      if (!doc) {
        throw new Error("Short code not found");
      }

      // Cache it for next time
      await setCache(cacheKey, doc, 60);

      // Increment counter (instead of DB write)
      await redis.incr(counterKey);

      return doc;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
