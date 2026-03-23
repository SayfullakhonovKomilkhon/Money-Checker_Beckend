import { Request, Response } from "express";
import { pool } from "../config/database";
import { ok, created, noContent } from "../utils/response";

export async function listTransactions(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { type, limit, offset } = req.query;

  let query = `
    SELECT id, user_id, category_id, amount, description,
           transaction_date, transaction_type, input_method, created_at
    FROM transactions
    WHERE user_id = $1`;
  const params: any[] = [userId];

  if (type === "income" || type === "expense") {
    params.push(type);
    query += ` AND transaction_type = $${params.length}`;
  }

  query += ` ORDER BY transaction_date DESC`;

  if (limit) {
    params.push(Number(limit));
    query += ` LIMIT $${params.length}`;
  }
  if (offset) {
    params.push(Number(offset));
    query += ` OFFSET $${params.length}`;
  }

  const { rows } = await pool.query(query, params);
  ok(res, rows);
}

export async function listTransactionsWithCategories(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;

  const { rows } = await pool.query(
    `SELECT
       t.id,
       t.user_id,
       t.amount,
       t.description,
       t.transaction_date,
       t.transaction_type,
       json_build_object(
         'id',    c.id,
         'user_id', c.user_id,
         'name',  c.name,
         'icon',  c.icon,
         'color', c.color,
         'created_at', c.created_at
       ) AS categories
     FROM transactions t
     INNER JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1
     ORDER BY t.transaction_date DESC`,
    [userId]
  );

  ok(res, rows);
}

export async function getTransaction(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT id, user_id, category_id, amount, description,
            transaction_date, transaction_type, input_method, created_at
     FROM transactions WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function createTransaction(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const {
    category_id,
    amount,
    description,
    transaction_date,
    transaction_type,
    input_method,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO transactions
         (user_id, category_id, amount, description, transaction_date, transaction_type, input_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, category_id, amount, description,
                 transaction_date, transaction_type, input_method, created_at`,
      [
        userId,
        category_id,
        amount,
        description ?? "",
        transaction_date ?? new Date().toISOString(),
        transaction_type,
        input_method ?? "manual",
      ]
    );

    const sign = transaction_type === "income" ? 1 : -1;
    await client.query(
      `INSERT INTO user_balance (user_id, balance, currency)
       VALUES ($1, $2, 'USD')
       ON CONFLICT (user_id) DO UPDATE
       SET balance = user_balance.balance + $2, updated_at = now()`,
      [userId, sign * Math.abs(amount)]
    );

    await client.query("COMMIT");
    created(res, rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateTransaction(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { category_id, amount, description, transaction_date, transaction_type } =
    req.body;

  const { rows } = await pool.query(
    `UPDATE transactions
     SET category_id       = COALESCE($3, category_id),
         amount            = COALESCE($4, amount),
         description       = COALESCE($5, description),
         transaction_date  = COALESCE($6, transaction_date),
         transaction_type  = COALESCE($7, transaction_type)
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, category_id, amount, description,
               transaction_date, transaction_type, input_method, created_at`,
    [id, userId, category_id, amount, description, transaction_date, transaction_type]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  ok(res, rows[0]);
}

export async function deleteTransaction(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { id } = req.params;

  const { rows } = await pool.query(
    `DELETE FROM transactions WHERE id = $1 AND user_id = $2
     RETURNING amount, transaction_type`,
    [id, userId]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  const { amount, transaction_type } = rows[0];
  const sign = transaction_type === "income" ? -1 : 1;
  await pool.query(
    `UPDATE user_balance SET balance = balance + $2, updated_at = now()
     WHERE user_id = $1`,
    [userId, sign * Math.abs(amount)]
  );

  noContent(res);
}
