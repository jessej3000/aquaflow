ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin'
  CHECK (role IN ('admin', 'staff'));
