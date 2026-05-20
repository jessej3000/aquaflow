ALTER TABLE users
  ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_branch_required_for_non_admin_check;

ALTER TABLE users
  ADD CONSTRAINT users_branch_required_for_non_admin_check
  CHECK (
    (role = 'admin' AND branch_id IS NULL)
    OR (role IN ('staff', 'assistant') AND branch_id IS NOT NULL)
  ) NOT VALID;
