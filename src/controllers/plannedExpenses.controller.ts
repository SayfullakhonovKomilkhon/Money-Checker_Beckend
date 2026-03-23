import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok, created, noContent } from "../utils/response";

export async function listPlannedExpenses(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, amount, date, notification_enabled, created_at
     FROM planned_expenses WHERE user_id = $1
     ORDER BY date ASC`,
    [userId]
  );

  ok(res, rows);
}

export async function getPlannedExpense(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT id, user_id, title, amount, date, notification_enabled, created_at
     FROM planned_expenses WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Planned expense not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function createPlannedExpense(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { title, amount, date, notification_enabled } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO planned_expenses (user_id, title, amount, date, notification_enabled)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, title, amount, date, notification_enabled, created_at`,
    [userId, title, amount, date, notification_enabled ?? false]
  );

  created(res, rows[0]);
}

export async function updatePlannedExpense(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { title, amount, date, notification_enabled } = req.body;

  const { rows } = await pool.query(
    `UPDATE planned_expenses
     SET title                = COALESCE($3, title),
         amount               = COALESCE($4, amount),
         date                 = COALESCE($5, date),
         notification_enabled = COALESCE($6, notification_enabled)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, title, amount, date, notification_enabled, created_at`,
    [id, userId, title, amount, date, notification_enabled]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Planned expense not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function deletePlannedExpense(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rowCount } = await pool.query(
    `DELETE FROM planned_expenses WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    res.status(404).json({ error: "Planned expense not found" });
    return;
  }

  noContent(res);
}
