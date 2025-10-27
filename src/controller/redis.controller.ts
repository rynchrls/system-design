import type { Request, Response } from "express";
import RedisService from "../services/redis.service.js";

export default class RedisController {
  static async getCache(req: Request, res: Response) {
    try {
      const data = await RedisService.getCache();
      res.status(200).json({ data, message: "Cache retrieved successfully" });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }

  static async cacheAside(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const {page = 1, limit = 10, filter = ""} = req.query as unknown as {page: number, limit: number, filter?: any};
      const data = await RedisService.cacheAside(userId, {page, limit, filter});
      res.status(200).json({ data, message: "Cache-Aside retrieved successfully" });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }
}
