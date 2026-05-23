CREATE TABLE IF NOT EXISTS subscriptions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id           UUID        NOT NULL,
  plan_type           TEXT        NOT NULL DEFAULT 'entry'
                                  CHECK (plan_type IN ('entry', 'mid')),
  billing_cycle       TEXT        NOT NULL DEFAULT 'monthly'
                                  CHECK (billing_cycle IN ('monthly', 'yearly')),
  status              TEXT        NOT NULL DEFAULT 'trial'
                                  CHECK (status IN ('trial', 'active', 'expiring_soon', 'expired')),
  start_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date            TIMESTAMPTZ NOT NULL,
  paymongo_payment_id TEXT,
  paymongo_link_id    TEXT,
  reminder_sent       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_tenant_id
  ON subscriptions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date
  ON subscriptions(end_date);

CREATE INDEX IF NOT EXISTS idx_subscriptions_link_id
  ON subscriptions(paymongo_link_id)
  WHERE paymongo_link_id IS NOT NULL;
