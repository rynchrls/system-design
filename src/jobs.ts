import { cronJobScheduledUtil } from "./utils/cron-job.util.js";
import RedisClient from "./config/redis.js";
import { getDB } from "./config/database.js";
import type { Order } from "./types/order.type.js";
import { convertToObjectId } from "./utils/convertToObjectId.util.js";
import { ObjectId } from "mongodb";
import { UrlShortnerRepo } from "./repos/urlShortener.repo.js";

const redis = new RedisClient().redis;

export default async () => {
  async function flushClickCounters() {
    console.log("🧠 Write-Behind Worker started for short code...");
    const keys = await redis.keys("clicks:*");
    console.log(keys);
    const db = getDB();

    for (const key of keys) {
      const shortCode = key.split(":")[1];
      const count = parseInt(await redis.get(key), 10);

      if (!isNaN(count) && count > 0) {
        // Update MongoDB
        await db.collection("short-code").updateOne(
          { shortCode },
          {
            $inc: { clicks: count },
            $set: { updatedAt: new Date() },
          },
        );

        // Remove counter after syncing
        await redis.del(key);
        console.log(`✅ Flushed ${count} clicks for ${shortCode}`);
      }
    }
  }
  flushClickCounters();

  cronJobScheduledUtil("1 * * * * *", async () => {
    // every 2 seconds
    console.log("🧠 Write-Behind Worker started...");

    const data = await redis.brpoplpush("write_behind_queue", "processing_queue", 0);
    if (!data) return;

    console.log(data);
    try {
      const order: Order = JSON.parse(data);
      order._id = new ObjectId(order._id);
      order.userId = convertToObjectId(order.userId);

      const insert = await getDB().collection("orders").insertOne(order);
      if (!insert?.insertedId) throw new Error("❌ DB write failed");

      console.log(`✅ Flushed to DB: ${insert.insertedId}`);

      // ✅ Clean up after success
      await redis.lrem("processing_queue", 1, data);
    } catch (err) {
      console.error("❌ Write-behind failed, retrying...", err);

      // ✅ Requeue safely (push first, then remove)
      await redis.lpush("write_behind_queue", data);
      await redis.lrem("processing_queue", 1, data);

      // small backoff before next attempt
      await new Promise((r) => setTimeout(r, 5000));
    }
  });

  cronJobScheduledUtil("1 * * * * *", async () => {
    console.log("Indexing for short-code collection starting....");
    UrlShortnerRepo.createIndexes();
  });
};
