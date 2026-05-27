CREATE TABLE IF NOT EXISTS email_providers (
  id            SERIAL      PRIMARY KEY,
  name          TEXT        NOT NULL UNIQUE,
  current_count INTEGER     NOT NULL DEFAULT 0,
  monthly_limit INTEGER     NOT NULL,
  reset_type    TEXT        NOT NULL CHECK (reset_type IN ('monthly', 'daily')),
  reset_date    TIMESTAMPTZ NOT NULL,
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
