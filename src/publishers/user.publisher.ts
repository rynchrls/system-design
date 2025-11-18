import { REDIS as redisPublisher } from "../config.js";

export const publishUserSignup = async (data: any) => {
  await redisPublisher.publish("user:signup", JSON.stringify(data));
  console.log("📤 Published:", data);
  return;
};
