import type { IShortUrl, PShortUrl } from "../models/urlShortener.model.js";
import { UrlShortnerRepo } from "../repos/urlShortener.repo.js";

export default class UrlShortenerService {
  static async createShortURl(payload: IShortUrl) {
    return await UrlShortnerRepo.createShortURl(payload);
  }

  static async getOriginalUrl(shortCode: string) {
    return await UrlShortnerRepo.getOriginalUrl(shortCode)
  }
}
