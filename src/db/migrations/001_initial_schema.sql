-- MoneyGramm — initial database schema
-- Aligned with iOS Swift models (CodingKeys → column names)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   TEXT,
    avatar_url  TEXT,
    email       TEXT UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. user_balance
-- ============================================================
CREATE TABLE IF NOT EXISTS user_balance (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance     NUMERIC(15,2) NOT NULL DEFAULT 0,
    currency    TEXT NOT NULL DEFAULT 'USD',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- ============================================================
-- 3. categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    icon        TEXT DEFAULT 'questionmark.circle',
    color       TEXT DEFAULT '#808080',
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- ============================================================
-- 4. transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount            NUMERIC(15,2) NOT NULL,
    description       TEXT NOT NULL DEFAULT '',
    transaction_date  TIMESTAMPTZ NOT NULL DEFAULT now(),
    transaction_type  TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    input_method      TEXT NOT NULL DEFAULT 'manual' CHECK (input_method IN ('manual', 'automatic', 'import')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user      ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date      ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category  ON transactions(category_id);

-- ============================================================
-- 5. goals
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    target_amount   NUMERIC(15,2) NOT NULL DEFAULT 0,
    current_amount  NUMERIC(15,2) NOT NULL DEFAULT 0,
    due_date        TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

-- ============================================================
-- 6. savings_goals
-- ============================================================
CREATE TABLE IF NOT EXISTS savings_goals (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title                 TEXT NOT NULL,
    target_amount         NUMERIC(15,2) NOT NULL DEFAULT 0,
    current_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
    monthly_contribution  NUMERIC(15,2) NOT NULL DEFAULT 0,
    deadline              TIMESTAMPTZ NOT NULL,
    category              TEXT NOT NULL DEFAULT '',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id);

-- ============================================================
-- 7. debts
-- ============================================================
CREATE TABLE IF NOT EXISTS debts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
    due_date    TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);

-- ============================================================
-- 8. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type              TEXT NOT NULL CHECK (type IN ('goal', 'expense', 'reminder', 'limit')),
    message           TEXT NOT NULL,
    related_goal_id   UUID,
    related_limit_id  UUID,
    is_read           BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ============================================================
-- 9. planned_expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS planned_expenses (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title                 TEXT NOT NULL,
    amount                NUMERIC(15,2) NOT NULL DEFAULT 0,
    date                  TEXT NOT NULL,
    notification_enabled  BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planned_expenses_user ON planned_expenses(user_id);

-- ============================================================
-- 10. savings
-- ============================================================
CREATE TABLE IF NOT EXISTS savings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
    type        TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_savings_user ON savings(user_id);

-- ============================================================
-- Row-Level Security (optional — enable when using Supabase Auth)
-- ============================================================
-- ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_balance     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE goals            ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings_goals    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE debts            ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE planned_expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_user_balance_updated_at
    BEFORE UPDATE ON user_balance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
