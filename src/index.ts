import express from "express";
import type { Request, Response } from "express";
import { PORT } from "./config.js";
import { connectToMongo } from "./config/database.js";
import router from "./routes/index.js";
const app = express();

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

app.use('/api/v1', router)
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
