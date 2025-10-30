import type { Request, Response } from "express";
import SQLService from "../services/sql.service.js";
import type { User } from "../generated/prisma/browser.js";

export default class SQLController {
  static async createRecord(req: Request, res: Response) {
    try {
      const payload = req.body as User;

      const result = await SQLService.createRecord(payload);

      res.status(201).json({ data: result, message: "Record created successfully" });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }

  static async getUserOders(req: Request, res: Response) {
    try {
        const id = req.params.id
        const result = await SQLService.getUserOrders(id as string);
        res.status(200).json({data: result, message: "User orders fetched successfully"});
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }
}
