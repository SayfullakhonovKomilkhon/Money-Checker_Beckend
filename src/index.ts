import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { pool, testConnection } from "./config/database";
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

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "db", "migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
  const client = await pool.connect();

  try {
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      await client.query(sql);
      console.log(`  ✓ ${file} applied`);
    }
    console.log("All migrations applied successfully");
  } catch (err: any) {
    if (err.message?.includes("already exists") || err.code === "42P07") {
      console.log("Tables already exist — skipping");
    } else {
      console.error("Migration error:", err.message);
    }
  } finally {
    client.release();
  }
}

async function start() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn("Starting without DB — some endpoints will fail");
  } else {
    await runMigrations();
  }

  app.listen(PORT, () => {
    console.log(`MoneyGramm API running on port ${PORT}`);
  });
}

start();
