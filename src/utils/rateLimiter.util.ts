import { REDIS } from "../config.js";
import type { Request, Response, NextFunction } from "express";

interface RateLimiterOptions {
  keyPrefix?: string;
  windowSizeInSeconds: number;
  maxRequests: number;
}

const redis = REDIS;

export const rateLimiter = (options: RateLimiterOptions) => {
  const prefix = options.keyPrefix ?? "rate_limit";

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const windowStart = now - options.windowSizeInSeconds * 1000;

    try {
      // 🧹 Remove timestamps outside the time window
      await redis.zremrangebyscore(key, 0, windowStart);

      // 📊 Count entries inside the current window
      const count = await redis.zcount(key, windowStart, now);

      if (count >= options.maxRequests) {
        console.warn(`[RateLimiter] Blocked IP: ${ip}, Count: ${count}`);
        return res.status(429).json({
          status: "error",
          message: "Too many requests. Please try again later.",
        });
      }

      // 🆕 Add current request timestamp
      await redis.zadd(key, now, `${now}-${Math.random()}`);

      // ⏳ Expire key (slightly larger than window)
      await redis.expire(key, options.windowSizeInSeconds + 5);

      next();
    } catch (err) {
      console.error("[RateLimiter] Error (ioredis):", err);
      next();
    }
  };
};
