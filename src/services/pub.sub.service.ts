import PubSubRepo from "../repos/pub.sub.repo.js";
import RedisRepo from "../repos/redis.repo.js";

export default class PubSubService {
  static async pubUser({ id, email }: { id: number; email: string }) {
    return await PubSubRepo.pubUser({ id, email });
  }
}
