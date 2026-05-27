-- Tracks per-provider send counts and reset schedules for the email fallback system.
-- Providers: resend (3,000/month), brevo (9,000/month), gmail (500/day)
CREATE TABLE IF NOT EXISTS email_providers (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  current_count INTEGER NOT NULL DEFAULT 0,
  monthly_limit INTEGER NOT NULL,
  reset_type   TEXT NOT NULL CHECK (reset_type IN ('monthly', 'daily')),
  reset_date   TIMESTAMPTZ NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the three providers. reset_date is the start of the next cycle from now.
INSERT INTO email_providers (name, monthly_limit, reset_type, reset_date)
VALUES
  ('resend', 3000, 'monthly', date_trunc('month', NOW()) + INTERVAL '1 month'),
  ('brevo',  9000, 'monthly', date_trunc('month', NOW()) + INTERVAL '1 month'),
  ('gmail',  500,  'daily',   date_trunc('day',   NOW()) + INTERVAL '1 day')
ON CONFLICT (name) DO NOTHING;
