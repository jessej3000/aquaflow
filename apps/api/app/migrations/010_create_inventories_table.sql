CREATE TABLE IF NOT EXISTS inventories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT,
  description TEXT,
  supplier TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventories_branch_id ON inventories(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventories_status ON inventories(status);
