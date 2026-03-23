import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok, created, noContent } from "../utils/response";

export async function listGoals(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, target_amount, current_amount, due_date, created_at
     FROM goals WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  ok(res, rows);
}

export async function getGoal(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, target_amount, current_amount, due_date, created_at
     FROM goals WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function createGoal(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { title, target_amount, current_amount, due_date } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO goals (user_id, title, target_amount, current_amount, due_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, title, target_amount, current_amount, due_date, created_at`,
    [userId, title, target_amount, current_amount ?? 0, due_date]
  );

  created(res, rows[0]);
}

export async function updateGoal(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { title, target_amount, current_amount, due_date } = req.body;

  const { rows } = await pool.query(
    `UPDATE goals
     SET title          = COALESCE($3, title),
         target_amount  = COALESCE($4, target_amount),
         current_amount = COALESCE($5, current_amount),
         due_date       = COALESCE($6, due_date)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, title, target_amount, current_amount, due_date, created_at`,
    [id, userId, title, target_amount, current_amount, due_date]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function deleteGoal(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rowCount } = await pool.query(
    `DELETE FROM goals WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  noContent(res);
}
