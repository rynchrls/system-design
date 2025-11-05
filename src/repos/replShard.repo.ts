import { ObjectId } from "mongodb";
import { getDBREPLSHARD } from "../config/repl_shard_database.js";
import type { RSOrder } from "../models/order.model.js";
import type { RSUser } from "../models/user.model.js";
import { convertToObjectId } from "../utils/convertToObjectId.util.js";

export class ReplShardRepo {
  static collection() {
    return getDBREPLSHARD().collection("users");
  }

  static collectionName(name: string) {
    return getDBREPLSHARD().collection(name);
  }

  static async insertDataToshard(data: any): Promise<any> {
    try {
      const user = 10;
      const orders = 20;
      const userList: RSUser[] = [];
      const orderList: RSOrder[] = [];
      const result = [];
      for (let i = 0; i < user; i++) {
        userList.push({
          _id: new ObjectId(),
          name: `User ${i}`,
          age: Math.floor(Math.random() * 50) + 20,
        });
      }
      for (let j = 0; j < userList.length; j++) {
        for (let k = 0; k < orders; k++) {
          orderList.push({
            _id: new ObjectId(),
            userId: new ObjectId(userList[j]?._id),
            productId: k + 1,
            productName: `Product ${k} of User ${userList[j]?._id}`,
          });
        }
      }
      const insertUser = await this.collectionName("users").insertMany(userList);
      const insertOrder = await this.collectionName("orders").insertMany(orderList);
      result.push(insertUser);
      result.push(insertOrder);
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async readOnSecondary(
    userId: string | ObjectId,
    { page = 1, limit = 10, filter }: { page: number; limit: number; filter?: any },
  ) {
    userId = convertToObjectId(userId);
    try {
      const pipeline = [
        {
          $match: { userId },
        },
        {
          $facet: {
            items: [{ $sort: { _id: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }],
            totalCount: [{ $count: "count" }],
          },
        },
      ];
      const res = await this.collectionName("orders")
        .aggregate(pipeline, { readPreference: "secondaryPreferred" })
        .toArray();
      return res;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
