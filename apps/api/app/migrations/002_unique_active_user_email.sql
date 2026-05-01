CREATE UNIQUE INDEX IF NOT EXISTS idx_users_active_email_unique
ON users (LOWER(email))
WHERE is_active = TRUE;
