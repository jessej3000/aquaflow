ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);
