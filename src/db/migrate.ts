import fs from "fs";
import path from "path";
import { pool } from "../config/database";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  console.log(`Found ${files.length} migration file(s)`);

  const client = await pool.connect();

  try {
    for (const file of files) {
      if (!file.endsWith(".sql")) continue;

      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      await client.query(sql);
      console.log(`  ✓ ${file} applied`);
    }

    console.log("All migrations applied successfully");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
