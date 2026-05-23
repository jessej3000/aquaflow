CREATE TABLE IF NOT EXISTS subscription_payments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id     UUID        NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  tenant_id           UUID        NOT NULL,
  paymongo_payment_id TEXT        NOT NULL,
  paymongo_event_type TEXT        NOT NULL,
  amount_centavos     INTEGER     NOT NULL,
  currency            TEXT        NOT NULL DEFAULT 'PHP',
  billing_name        TEXT,
  billing_email       TEXT,
  billing_phone       TEXT,
  payment_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_billing_date   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_payments_payment_id
  ON subscription_payments(paymongo_payment_id);

CREATE INDEX IF NOT EXISTS idx_sub_payments_subscription_id
  ON subscription_payments(subscription_id);

CREATE INDEX IF NOT EXISTS idx_sub_payments_tenant_id
  ON subscription_payments(tenant_id);
