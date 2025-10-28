import type { ObjectId } from "mongodb";

enum OrderStatus {
  PENDING = "PENDING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface Order {
    _id?: ObjectId;
    userId: string | ObjectId;
    productId: number;
    productName: string;
    status: OrderStatus
}