-- MoneyGramm — seed / test data

-- 1. Demo user
INSERT INTO users (id, full_name, email, created_at)
VALUES (
    '79594d62-5472-4d5a-8743-86788f8b8b8b',
    'Demo User',
    'demo@example.com',
    now()
) ON CONFLICT (id) DO NOTHING;

-- 2. User balance
INSERT INTO user_balance (id, user_id, balance, currency, updated_at)
VALUES (
    '08d45116-dfa9-4676-9e6c-930659b70b8b',
    '79594d62-5472-4d5a-8743-86788f8b8b8b',
    10800.00,
    'USD',
    now()
) ON CONFLICT (user_id) DO UPDATE SET
    balance    = EXCLUDED.balance,
    updated_at = EXCLUDED.updated_at;

-- 3. Categories
INSERT INTO categories (id, user_id, name, icon, color)
VALUES
    (gen_random_uuid(), '79594d62-5472-4d5a-8743-86788f8b8b8b', 'Groceries',      'cart.fill',           '#007AFF'),
    (gen_random_uuid(), '79594d62-5472-4d5a-8743-86788f8b8b8b', 'Transport',       'car.fill',            '#FF3B30'),
    (gen_random_uuid(), '79594d62-5472-4d5a-8743-86788f8b8b8b', 'Entertainment',   'gamecontroller.fill', '#FF9500'),
    (gen_random_uuid(), '79594d62-5472-4d5a-8743-86788f8b8b8b', 'Health',          'heart.fill',          '#FF2D92'),
    (gen_random_uuid(), '79594d62-5472-4d5a-8743-86788f8b8b8b', 'Salary',          'briefcase.fill',      '#4CAF50')
ON CONFLICT DO NOTHING;

-- 4. Transactions (using the categories we just created)
WITH cat AS (
    SELECT id, name FROM categories
    WHERE user_id = '79594d62-5472-4d5a-8743-86788f8b8b8b'
)
INSERT INTO transactions (id, user_id, category_id, amount, description, transaction_date, transaction_type, input_method)
SELECT
    gen_random_uuid(),
    '79594d62-5472-4d5a-8743-86788f8b8b8b',
    c.id,
    t.amount,
    t.descr,
    now() - (t.days_ago || ' days')::interval,
    t.tx_type,
    'manual'
FROM cat c
JOIN (VALUES
    ('Salary',       15000.00, 'Monthly salary',        'income',  0),
    ('Groceries',     150.00, 'Grocery shopping',       'expense', 1),
    ('Transport',      45.00, 'Gas station',            'expense', 2),
    ('Entertainment', 200.00, 'Cinema & dinner',        'expense', 3)
) AS t(cat_name, amount, descr, tx_type, days_ago)
ON c.name = t.cat_name
ON CONFLICT DO NOTHING;

-- 5. Goals
INSERT INTO goals (id, user_id, title, target_amount, current_amount, due_date)
VALUES
    (gen_random_uuid(), '79594d62-5472-4d5a-8743-86788f8b8b8b', 'Vacation Fund',  50000.00, 15000.00, '2026-08-01'),
    (gen_random_uuid(), '79594d62-5472-4d5a-8743-86788f8b8b8b', 'Buy a Car',    1500000.00, 300000.00, '2027-01-01')
ON CONFLICT DO NOTHING;

-- 6. Savings goals
INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, monthly_contribution, deadline, category)
VALUES
    (gen_random_uuid(), '79594d62-5472-4d5a-8743-86788f8b8b8b', 'Emergency Fund', 100000.00, 25000.00, 5000.00, '2026-12-31', 'Emergency')
ON CONFLICT DO NOTHING;
