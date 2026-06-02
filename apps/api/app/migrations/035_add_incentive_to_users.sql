ALTER TABLE users ADD COLUMN IF NOT EXISTS incentive BOOLEAN DEFAULT NULL;

-- Delivery users start with incentive = false; all other roles stay NULL
UPDATE users SET incentive = FALSE WHERE role = 'delivery' AND incentive IS NULL;
