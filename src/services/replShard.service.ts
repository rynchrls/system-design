import { ReplShardRepo } from "../repos/replShard.repo.js";

export class ReplShardService {
  static async insertDataToshard(data: any): Promise<any> {
    return await ReplShardRepo.insertDataToshard(data);
  }

  static async readOnSecondary(
    userId: string,
    { page = 1, limit = 10, filter }: { page: number; limit: number; filter?: any },
  ) {
    return await ReplShardRepo.readOnSecondary(userId, { page, limit, filter });
  }
}
