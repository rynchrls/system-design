import type { ObjectId } from "mongodb";

export interface RSOrder {
  _id: ObjectId;
  userId: ObjectId;
  productId: number;
  productName: string;
}

export class OrderModel implements Partial<RSOrder> {
  _id: ObjectId;
  userId: ObjectId;
  productId: number;
  productName: string;
  constructor({ _id, userId, productId, productName } = {} as RSOrder) {
    this._id = _id;
    this.userId = userId;
    this.productId = productId;
    this.productName = productName;
  }
}
