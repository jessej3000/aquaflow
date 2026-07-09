-- Adds a hidden "thanos" role used only for the internal /ff feature-flag console.
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'staff', 'assistant', 'delivery', 'thanos'));

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_branch_required_for_non_admin_check;

ALTER TABLE users
  ADD CONSTRAINT users_branch_required_for_non_admin_check
  CHECK (
    (role IN ('admin', 'thanos') AND branch_id IS NULL)
    OR (role IN ('staff', 'assistant', 'delivery') AND branch_id IS NOT NULL)
  ) NOT VALID;

-- Feature flags managed via the /ff console.
CREATE TABLE IF NOT EXISTS feature_flags (
  id          SERIAL PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
