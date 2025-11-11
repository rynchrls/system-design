import type { Request, Response } from "express";
import UrlShortenerService from "../services/urlShortener.service.js";
import type { IShortUrl, PShortUrl } from "../models/urlShortener.model.js";

export default class UrlShortenerController {
  static async createShortURl(req: Request, res: Response) {
    try {
      const payload = req.body as IShortUrl;
      const result = await UrlShortenerService.createShortURl(payload);
      res.status(201).json({ data: result, message: "Record created successfully" });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }

  static async getOriginalUrl(req: Request, res: Response) {
    try {
      const shortCode = req.params.shortCode as string;
      const result = await UrlShortenerService.getOriginalUrl(shortCode);
      res.status(201).json({ data: result, message: "Record created successfully" });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message });
    }
  }
}
