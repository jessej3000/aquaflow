-- Migration: 027_create_products_table.sql
-- Creates the products table to store product/catalog items for branches

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  components JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Optional: add an index on components if queries will search within the JSON
-- CREATE INDEX idx_products_components ON products USING gin (components);
