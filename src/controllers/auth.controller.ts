import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { ok } from "../utils/response";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const ACCESS_TOKEN_TTL = 7 * 24 * 60 * 60;   // 7 days in seconds
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60;  // 30 days in seconds
const SALT_ROUNDS = 12;

function generateTokens(userId: string) {
  const access_token = jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
  const refresh_token = jwt.sign({ sub: userId, type: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
  return { access_token, refresh_token };
}

export async function signUp(req: Request, res: Response): Promise<void> {
  const { email, password, full_name } = req.body;

  const existing = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );

  if (existing.rows.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, now(), now())
     RETURNING id, full_name, email, created_at, updated_at`,
    [full_name, email, password_hash]
  );

  const user = rows[0];

  await pool.query(
    `INSERT INTO user_balance (user_id, balance, currency)
     VALUES ($1, 0, 'USD')`,
    [user.id]
  );

  const tokens = generateTokens(user.id);

  ok(res, {
    ...tokens,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
    },
  });
}

export async function signIn(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const { rows } = await pool.query(
    `SELECT id, full_name, email, password_hash FROM users WHERE email = $1`,
    [email]
  );

  if (rows.length === 0) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const tokens = generateTokens(user.id);

  ok(res, {
    ...tokens,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
    },
  });
}

export async function refreshToken(
  req: Request,
  res: Response
): Promise<void> {
  const { refresh_token } = req.body;

  try {
    const payload = jwt.verify(refresh_token, JWT_SECRET) as {
      sub: string;
      type?: string;
    };

    if (payload.type !== "refresh") {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const tokens = generateTokens(payload.sub);
    ok(res, tokens);
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
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
