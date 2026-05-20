ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_branch_required_for_non_admin_check;

ALTER TABLE users
  ADD CONSTRAINT users_branch_required_for_non_admin_check
  CHECK (
    (role = 'admin' AND branch_id IS NULL)
    OR (role IN ('staff', 'assistant', 'delivery') AND branch_id IS NOT NULL)
  ) NOT VALID;
