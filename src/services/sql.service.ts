import type { User } from "../generated/prisma/browser.js";
import SQLRepo from "../repos/sql.repo.js";

export default class SQLService {
    
    static async createRecord(payload: User) {
        return await SQLRepo.create(payload);
    }

    static async getUserOrders(id: string) {
        return await SQLRepo.sampleExpensiveQuery(id);
    }
}