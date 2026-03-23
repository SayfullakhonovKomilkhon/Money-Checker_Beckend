import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok } from "../utils/response";

export async function getBalance(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT id, user_id, balance, currency, updated_at
     FROM user_balance WHERE user_id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    const { rows: created } = await pool.query(
      `INSERT INTO user_balance (user_id, balance, currency)
       VALUES ($1, 0, 'USD')
       RETURNING id, user_id, balance, currency, updated_at`,
      [userId]
    );
    ok(res, created[0]);
    return;
  }

  ok(res, rows[0]);
}

export async function updateBalance(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { balance, currency } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO user_balance (user_id, balance, currency, updated_at)
     VALUES ($1, $2, COALESCE($3, 'USD'), now())
     ON CONFLICT (user_id) DO UPDATE SET
       balance    = EXCLUDED.balance,
       currency   = COALESCE(EXCLUDED.currency, user_balance.currency),
       updated_at = now()
     RETURNING id, user_id, balance, currency, updated_at`,
    [userId, balance, currency]
  );

  ok(res, rows[0]);
}
