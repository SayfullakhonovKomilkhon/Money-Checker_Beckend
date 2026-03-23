import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";
import { pool } from "../config/database";
import { ok } from "../utils/response";

export async function signUp(req: Request, res: Response): Promise<void> {
  const { email, password, full_name } = req.body;

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    res.status(400).json({ error: authError.message });
    return;
  }

  const userId = authData.user.id;

  await pool.query(
    `INSERT INTO users (id, full_name, email, created_at, updated_at)
     VALUES ($1, $2, $3, now(), now())
     ON CONFLICT (id) DO NOTHING`,
    [userId, full_name, email]
  );

  await pool.query(
    `INSERT INTO user_balance (user_id, balance, currency)
     VALUES ($1, 0, 'USD')
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  const { data: session, error: signInError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (signInError) {
    ok(res, { user_id: userId, message: "User created. Sign in manually." });
    return;
  }

  ok(res, { user_id: userId, email });
}

export async function signIn(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(401).json({ error: error.message });
    return;
  }

  ok(res, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  });
}

export async function refreshToken(
  req: Request,
  res: Response
): Promise<void> {
  const { refresh_token } = req.body;

  const { data, error } = await supabaseAdmin.auth.refreshSession({
    refresh_token,
  });

  if (error || !data.session) {
    res.status(401).json({ error: error?.message ?? "Failed to refresh" });
    return;
  }

  ok(res, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  });
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
