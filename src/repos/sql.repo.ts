import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import type { User } from "../generated/prisma/browser.js";

export default class SQLRepo {
  private static prisma = new PrismaClient();

  //   static async bulkCreate(payload: User) {
  //     try {
  //       const orders = []
  //       const totalRecords = 20;
  //       const all = await this.prisma.user.findMany({});
  //       for (let i = 0; i < all.length; i++) {
  //         for (let j = 0; j < totalRecords; j++) {
  //             orders.push({
  //                 productId: j + 1,
  //                 productName: `Product ${j + 1}`,
  //                 userId: all[i]?.id!
  //             })
  //         }
  //       }
  //       return await this.prisma.order.createMany({data: orders});
  //     } catch (error: any) {
  //         throw new Error(error.message)
  //     }
  //   }

  static async create(payload: User) {
    try {
      const data = await this.prisma.user.create({
        data: payload,
      });
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async findAll() {
    try {
      return await this.prisma.user.findMany({});
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async findOneById(id: string) {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async updateById(id: string, payload: Partial<User>) {
    try {
      return await this.prisma.user.update({ where: { id }, data: payload });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async deleteUser(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async multipleCreate(payload: any) {
    try {
      await this.prisma.$transaction([
        this.prisma.user.create({ data: { name: "John", age: 22 } }),
        this.prisma.order.create({
          data: { userId: payload.userId, productId: 1, productName: "Keyboard" },
        }),
      ]);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async pagination(id: string) {
    try {
      const page = 1;
      const limit = 10;

      const [user, total] = await Promise.all([
        this.prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.user.count({ where: { age: { gt: 18 } } }),
      ]);

      return { user, total };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async sampleExpensiveQuery(id: string) {
    try {
      const page = 1;
      const limit = 10;
      const orderLimit = 3;

      const users = await this.prisma.user.findMany({
        where: { id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: orderLimit,
          },
        },
      });
      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
