-- Migration: 028_add_branch_id_to_products_table.sql
-- Adds a branch_id foreign key to products so products can be scoped to branches

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS branch_id INTEGER;

-- Add FK constraint if branches table exists. Uses ON DELETE SET NULL to avoid cascade deletes.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branches') THEN
    BEGIN
      ALTER TABLE products
        ADD CONSTRAINT products_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      -- constraint already exists, ignore
      NULL;
    END;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_products_branch_id ON products(branch_id);
