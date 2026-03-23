import fs from "fs";
import path from "path";
import { pool } from "../config/database";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  const seedFile = path.join(__dirname, "migrations", "002_seed_data.sql");

  if (!fs.existsSync(seedFile)) {
    console.error("Seed file not found:", seedFile);
    process.exit(1);
  }

  console.log("Running seed data...");
  const sql = fs.readFileSync(seedFile, "utf-8");

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("Seed data applied successfully");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
