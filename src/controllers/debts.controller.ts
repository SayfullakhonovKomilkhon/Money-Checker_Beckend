import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok, created, noContent } from "../utils/response";

export async function listDebts(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, amount, due_date, status, created_at
     FROM debts WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  ok(res, rows);
}

export async function getDebt(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, amount, due_date, status, created_at
     FROM debts WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Debt not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function createDebt(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { title, amount, due_date, status } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO debts (user_id, title, amount, due_date, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, title, amount, due_date, status, created_at`,
    [userId, title, amount, due_date, status ?? "pending"]
  );

  created(res, rows[0]);
}

export async function updateDebt(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { title, amount, due_date, status } = req.body;

  const { rows } = await pool.query(
    `UPDATE debts
     SET title    = COALESCE($3, title),
         amount   = COALESCE($4, amount),
         due_date = COALESCE($5, due_date),
         status   = COALESCE($6, status)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, title, amount, due_date, status, created_at`,
    [id, userId, title, amount, due_date, status]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Debt not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function deleteDebt(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rowCount } = await pool.query(
    `DELETE FROM debts WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    res.status(404).json({ error: "Debt not found" });
    return;
  }

  noContent(res);
}
