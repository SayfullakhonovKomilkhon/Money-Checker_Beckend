import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok } from "../utils/response";

export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT id, full_name, avatar_url, email, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function updateProfile(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { full_name, avatar_url } = req.body;

  const { rows } = await pool.query(
    `UPDATE users
     SET full_name  = COALESCE($2, full_name),
         avatar_url = COALESCE($3, avatar_url),
         updated_at = now()
     WHERE id = $1
     RETURNING id, full_name, avatar_url, email, created_at, updated_at`,
    [userId, full_name, avatar_url]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  ok(res, rows[0]);
}
