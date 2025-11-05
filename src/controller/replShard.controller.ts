import type { Request, Response } from "express";
import { ReplShardService } from "../services/replShard.service.js";

export class ReplShardController {
  static async insertDataToshard(req: Request, res: Response) {
    try {
      const result = await ReplShardService.insertDataToshard(req.body);
      res.status(200).json({ data: result, message: "Data inserted to shard successfully" });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }

  static async readOnSecondary(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const {
        page = 1,
        limit,
        filter = "",
      } = req.query as unknown as { page: number; limit: string; filter?: any };
      const result = await ReplShardService.readOnSecondary(userId, { page, limit: parseInt(limit), filter });
      res.status(200).json({ data: result, message: "Data delivered from shard successfully" });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }
}
