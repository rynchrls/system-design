import { Router } from "express";
import redisRouter from "./redis.route.js";
import sqlRouter from "./sql.route.js";
import replShardRoute from "./replShard.route.js";
import urlShortenerRoute from "./urlShortener.route.js";
import pubSubRouter from "./pub.sub.route.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Hello, Express + TypeScript!");
});

router.use("/redis", redisRouter);
router.use("/sql", sqlRouter);
router.use("/repl-shard", replShardRoute);
router.use("/shortener", urlShortenerRoute);
router.use("/pub-sub", pubSubRouter);

export default router;
