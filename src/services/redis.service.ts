import RedisRepo from "../repos/redis.repo.js";
import type { Order } from "../types/order.type.js";

export default class RedisService {
  static async getCache() {
    return await RedisRepo.getCache();
  }

  static async cacheAside(
    userId: string,
    { page = 1, limit = 10, filter }: { page: number; limit: number; filter?: any },
  ) {
    return await RedisRepo.cacheAside(userId, { page, limit, filter });
  }

  static async writeThrough(payload: Order) {
    return await RedisRepo.writeThrough(payload);
  }
  static async writeBehind(payload: Order) {
    return await RedisRepo.writeBehind(payload);
  }
}
