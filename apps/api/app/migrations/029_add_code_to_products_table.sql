-- Migration: 029_add_code_to_products_table.sql
-- Adds a code field to products and reorders the table so code appears immediately after id.

BEGIN;

-- Ensure the new column exists before recreating the table.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS code TEXT;

-- Recreate the table with the desired column order.
CREATE TABLE IF NOT EXISTS products_new (
  id INTEGER PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  branch_id INTEGER
);

INSERT INTO products_new (id, code, name, description, unit_price, components, branch_id)
SELECT id, code, name, description, unit_price, components, branch_id FROM products ORDER BY id;

ALTER TABLE products RENAME TO products_old;
ALTER TABLE products_new RENAME TO products;

-- Recreate the sequence on products.id if needed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S' AND c.relname = 'products_id_seq'
  ) THEN
    CREATE SEQUENCE products_id_seq;
  END IF;
END$$;

ALTER SEQUENCE products_id_seq OWNED BY products.id;
ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('products_id_seq');
DO $$
DECLARE
  max_id INTEGER;
BEGIN
  SELECT MAX(id) INTO max_id FROM products;
  IF max_id IS NULL THEN
    PERFORM setval('products_id_seq', 1, false);
  ELSE
    PERFORM setval('products_id_seq', max_id, true);
  END IF;
END$$;

-- Recreate branch foreign key constraint and supporting index.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branches') THEN
    BEGIN
      ALTER TABLE products
        ADD CONSTRAINT products_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_products_branch_id ON products(branch_id);

DROP TABLE IF EXISTS products_old;

COMMIT;
