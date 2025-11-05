import express from "express";
import type { Request, Response } from "express";
import { PORT } from "./config.js";
import { connectToMongo } from "./config/database.js";
import router from "./routes/index.js";
import jobs from "./jobs.js";
import { connectToMongoReplShard } from "./config/repl_shard_database.js";

const app = express();
// ✅ Must be here BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express + TypeScript!");
});

connectToMongo()
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error(error);
  });
connectToMongoReplShard()
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error(error);
  });

jobs();

app.use("/api/v1", router);
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
