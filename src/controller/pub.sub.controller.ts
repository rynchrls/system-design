import type { Request, Response } from "express";
import PubSubService from "../services/pub.sub.service.js";

export default class PubSubController {
  static async pubUser(req: Request, res: Response) {
    try {
      const payload = req.body as unknown as { id: number; email: string };
      await PubSubService.pubUser(payload)
      res.status(200).json({ data: payload, message: "Created successfully" });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }
}
