import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok, created, noContent } from "../utils/response";

export async function listNotifications(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { unread_only } = req.query;

  let query = `
    SELECT id, user_id, type, message, related_goal_id, related_limit_id, is_read, created_at
    FROM notifications WHERE user_id = $1`;
  const params: any[] = [userId];

  if (unread_only === "true") {
    query += ` AND is_read = false`;
  }

  query += ` ORDER BY created_at DESC`;

  const { rows } = await pool.query(query, params);
  ok(res, rows);
}

export async function createNotification(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { type, message, related_goal_id, related_limit_id } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, message, related_goal_id, related_limit_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, type, message, related_goal_id, related_limit_id, is_read, created_at`,
    [userId, type, message, related_goal_id, related_limit_id]
  );

  created(res, rows[0]);
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, type, message, related_goal_id, related_limit_id, is_read, created_at`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function markAllAsRead(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;

  await pool.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );

  ok(res, { message: "All notifications marked as read" });
}

export async function deleteNotification(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rowCount } = await pool.query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  noContent(res);
}
