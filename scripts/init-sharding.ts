/**
 * scripts/init-sharding.ts
 *
 * One-time setup script for enabling sharding and defining shard keys
 * on your MongoDB sharded cluster.
 */

import { MongoClient } from "mongodb";
import { REPL_SHARD_DB, REPL_SHARD_URI } from "../src/config.js";

const setupSharding = async () => {
  const client = new MongoClient(REPL_SHARD_URI, {
    maxPoolSize: 5,
    connectTimeoutMS: 60000,
  });

  try {
    await client.connect();
    const adminDB = client.db("admin");

    console.log(`🚀 Connecting to MongoDB cluster...`);

    // Enable sharding for your app DB
    try {
      await adminDB.command({ enableSharding: REPL_SHARD_DB });
      console.log(`✅ Sharding enabled for database: ${REPL_SHARD_DB}`);
    } catch (error: any) {
      if (error.message.includes("already enabled")) {
        console.warn("⚠️ Database already sharded — skipping enableSharding.");
      } else {
        throw error;
      }
    }

    // Shard the users collection by _id
    try {
      await adminDB.command({
        shardCollection: `${REPL_SHARD_DB}.users`,
        key: { _id: "hashed" },
      });
      console.log("✅ Shard key set for users collection.");
    } catch (error: any) {
      if (error.message.includes("already sharded")) {
        console.warn("⚠️ users collection already sharded — skipping.");
      } else {
        throw error;
      }
    }

    // Shard the orders collection by userId
    try {
      await adminDB.command({
        shardCollection: `${REPL_SHARD_DB}.orders`,
        key: { userId: "hashed" },
      });
      console.log("✅ Shard key set for orders collection.");
    } catch (error: any) {
      if (error.message.includes("already sharded")) {
        console.warn("⚠️ orders collection already sharded — skipping.");
      } else {
        throw error;
      }
    }

    console.log("🎉 MongoDB Sharding setup completed successfully!");
  } catch (err: any) {
    console.error("❌ Failed to setup MongoDB sharding:", err.message);
  } finally {
    await client.close();
    console.log("🔌 MongoDB connection closed.");
  }
};

setupSharding();
