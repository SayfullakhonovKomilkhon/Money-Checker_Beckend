import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok, created, noContent } from "../utils/response";

export async function listSavings(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, amount, type, created_at
     FROM savings WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  ok(res, rows);
}

export async function getSaving(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, amount, type, created_at
     FROM savings WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Saving not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function createSaving(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { title, amount, type } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO savings (user_id, title, amount, type, created_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, title, amount, type, created_at`,
    [userId, title, amount, type ?? "", new Date().toISOString()]
  );

  created(res, rows[0]);
}

export async function updateSaving(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { title, amount, type } = req.body;

  const { rows } = await pool.query(
    `UPDATE savings
     SET title  = COALESCE($3, title),
         amount = COALESCE($4, amount),
         type   = COALESCE($5, type)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, title, amount, type, created_at`,
    [id, userId, title, amount, type]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Saving not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function deleteSaving(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rowCount } = await pool.query(
    `DELETE FROM savings WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    res.status(404).json({ error: "Saving not found" });
    return;
  }

  noContent(res);
}
