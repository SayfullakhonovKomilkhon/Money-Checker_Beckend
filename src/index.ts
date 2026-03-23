import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { testConnection } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan("short"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use(errorHandler);

async function start() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn("Starting without DB — some endpoints will fail");
  }

  app.listen(PORT, () => {
    console.log(`MoneyGramm API running on port ${PORT}`);
  });
}

start();
