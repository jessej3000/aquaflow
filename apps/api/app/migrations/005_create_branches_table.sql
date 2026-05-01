CREATE TABLE IF NOT EXISTS branches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id CHAR(5) NOT NULL UNIQUE CHECK (unit_id ~ '^[0-9]{5}$'),
  name TEXT,
  address TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_user_id ON branches(user_id);
