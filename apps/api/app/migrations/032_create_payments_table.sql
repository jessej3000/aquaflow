CREATE TABLE IF NOT EXISTS payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  reference_type TEXT NOT NULL CHECK (reference_type IN ('order', 'sale')),
  reference_id BIGINT NOT NULL,

  paymongo_session_id TEXT UNIQUE,
  paymongo_payment_id TEXT,
  payment_method TEXT,

  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'PHP',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),

  checkout_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(paymongo_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
