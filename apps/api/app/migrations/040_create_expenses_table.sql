CREATE TABLE IF NOT EXISTS expenses (
    id          SERIAL PRIMARY KEY,
    branch_id   INTEGER       NOT NULL REFERENCES branches(id),
    category    VARCHAR(50)   NOT NULL
                  CHECK (category IN ('utilities','supplies','salaries','maintenance','rent','other')),
    description TEXT,
    amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    expense_date DATE         NOT NULL,
    created_by  INTEGER       REFERENCES users(id),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted     BOOLEAN       NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_expenses_branch_date  ON expenses (branch_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_deleted       ON expenses (deleted);
