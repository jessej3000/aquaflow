-- Adds email-activation fields to the users table.
-- email_verified defaults TRUE so existing users are unaffected.
-- New registrations are created with email_verified = FALSE by application code
-- and must click the activation link before they can sign in.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified            BOOLEAN    NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_verification_token  TEXT,
  ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ;

-- Partial unique index — only enforces uniqueness on non-null tokens.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_verification_token
  ON users(email_verification_token)
  WHERE email_verification_token IS NOT NULL;
