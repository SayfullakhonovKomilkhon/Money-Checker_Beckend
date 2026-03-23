import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok, created, noContent } from "../utils/response";

export async function listSavingsGoals(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, target_amount, current_amount,
            monthly_contribution, deadline, category, created_at
     FROM savings_goals WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  ok(res, rows);
}

export async function getSavingsGoal(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, target_amount, current_amount,
            monthly_contribution, deadline, category, created_at
     FROM savings_goals WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Savings goal not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function createSavingsGoal(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { title, target_amount, current_amount, monthly_contribution, deadline, category } =
    req.body;

  const { rows } = await pool.query(
    `INSERT INTO savings_goals
       (user_id, title, target_amount, current_amount, monthly_contribution, deadline, category)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, title, target_amount, current_amount,
               monthly_contribution, deadline, category, created_at`,
    [userId, title, target_amount, current_amount ?? 0, monthly_contribution ?? 0, deadline, category ?? ""]
  );

  created(res, rows[0]);
}

export async function updateSavingsGoal(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { title, target_amount, current_amount, monthly_contribution, deadline, category } =
    req.body;

  const { rows } = await pool.query(
    `UPDATE savings_goals
     SET title                = COALESCE($3, title),
         target_amount        = COALESCE($4, target_amount),
         current_amount       = COALESCE($5, current_amount),
         monthly_contribution = COALESCE($6, monthly_contribution),
         deadline             = COALESCE($7, deadline),
         category             = COALESCE($8, category)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, title, target_amount, current_amount,
               monthly_contribution, deadline, category, created_at`,
    [id, userId, title, target_amount, current_amount, monthly_contribution, deadline, category]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Savings goal not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function deleteSavingsGoal(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rowCount } = await pool.query(
    `DELETE FROM savings_goals WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    res.status(404).json({ error: "Savings goal not found" });
    return;
  }

  noContent(res);
}
