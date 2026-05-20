CREATE TABLE IF NOT EXISTS maintenance (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name TEXT NOT NULL,
  supplier TEXT,
  contact TEXT,
  expiration_days INTEGER NOT NULL DEFAULT 0 CHECK (expiration_days >= 0),
  date_replaced DATE,
  branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_maintenance_code ON maintenance(code);
CREATE INDEX IF NOT EXISTS idx_maintenance_branch_id ON maintenance(branch_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant_id ON maintenance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON maintenance(user_id);
