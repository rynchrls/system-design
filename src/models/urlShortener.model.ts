import type { ObjectId } from "mongodb";

export interface IShortUrl {
  _id: ObjectId;
  shortCode: string;
  originalUrl: string;
  expireAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  clicks: number;
  title: string;
  ownerId?: string;
}

export class ShortUrl implements Partial<IShortUrl> {
  _id: ObjectId;
  shortCode: string;
  originalUrl: string;
  expireAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  clicks: number;
  title: string;
  ownerId?: string;
  constructor(
    {
      _id,
      shortCode,
      originalUrl,
      expireAt,
      createdAt,
      updatedAt,
      clicks,
      title,
      ownerId,
    } = {} as IShortUrl,
  ) {
    this._id = _id;
    this.shortCode = shortCode;
    this.originalUrl = originalUrl;
    this.expireAt = expireAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.clicks = clicks;
    this.title = title;
    this.ownerId = ownerId || "";
  }
}

export interface PShortUrl extends IShortUrl {
  originalURl: string;
  title: string;
}
