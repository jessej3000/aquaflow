-- Migration: 030_add_code_column_to_products_table.sql
-- Ensures the code column exists on products for product catalog items.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS code TEXT;
