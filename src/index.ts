import express from "express";
import type { Request, Response } from "express";
import router from "./routes/index.js";

const app = express();
// ✅ Must be here BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express + TypeScript!");
});


app.use("/api/v1", router);

export default app