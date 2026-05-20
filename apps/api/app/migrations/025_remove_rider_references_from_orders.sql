-- Remove rider_id foreign key and index from orders table
-- This migration should run AFTER 024_drop_riders_table.sql

-- Remove the index on rider_id
DROP INDEX IF EXISTS idx_orders_rider_id;

-- Drop the foreign key constraint and remove the column
ALTER TABLE orders DROP COLUMN IF EXISTS rider_id;
