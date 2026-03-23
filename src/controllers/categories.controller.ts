import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok, created, noContent } from "../utils/response";

export async function listCategories(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT id, user_id, name, icon, color, created_at
     FROM categories
     WHERE user_id = $1
     ORDER BY name ASC`,
    [userId]
  );

  ok(res, rows);
}

export async function getCategory(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT id, user_id, name, icon, color, created_at
     FROM categories WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function createCategory(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { name, icon, color } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO categories (user_id, name, icon, color)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, name, icon, color, created_at`,
    [userId, name, icon ?? "questionmark.circle", color ?? "#808080"]
  );

  created(res, rows[0]);
}

export async function updateCategory(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { name, icon, color } = req.body;

  const { rows } = await pool.query(
    `UPDATE categories
     SET name  = COALESCE($3, name),
         icon  = COALESCE($4, icon),
         color = COALESCE($5, color)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, name, icon, color, created_at`,
    [id, userId, name, icon, color]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function deleteCategory(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rowCount } = await pool.query(
    `DELETE FROM categories WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  noContent(res);
}
