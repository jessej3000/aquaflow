CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,

  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username TEXT,

  branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
  branchname TEXT,

  type TEXT NOT NULL DEFAULT 'suggestion' CHECK (type IN ('bug', 'suggestion')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processed', 'implemented', 'ignored')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_branch_id ON feedback(branch_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
