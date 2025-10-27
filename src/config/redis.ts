import Redis from "ioredis";
import { REDIS_PORT } from "../config.js";

export default class RedisClient {
  redis = new (Redis as any)({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  });

  constructor() {
    this.redis.on("connect", () => console.log("✅ RedisClient connected"));
    this.redis.on("error", (err: any) => console.error("❌ RedisClient error:", err.message));
  }
}
