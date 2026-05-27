-- Records every email send attempt (successful or failed) for audit and debugging.
CREATE TABLE IF NOT EXISTS email_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient     TEXT NOT NULL,
  subject       TEXT NOT NULL,
  provider      TEXT NOT NULL,
  success       BOOLEAN NOT NULL,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
