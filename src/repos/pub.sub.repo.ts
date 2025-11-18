import { publishUserSignup } from "../publishers/user.publisher.js";

export default class PubSubRepo {
  static async pubUser({ id, email }: { id: number; email: string }) {
    try {
      await publishUserSignup({ id, email });
      return { id, email };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
