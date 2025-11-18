import { redisSubscriber } from "../config.js";

export const notificationSubscriber = async () => {
  await redisSubscriber.subscribe("user:signup");

  redisSubscriber.on("message", (channel: any, message: any) => {
    console.log(`📩 Received event on channel ${channel}:`, message);
  });

  console.log("👂 Redis subscriber listening...");
};
