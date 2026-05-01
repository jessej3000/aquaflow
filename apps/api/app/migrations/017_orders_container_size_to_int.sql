ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_container_size_check;

ALTER TABLE orders
  ALTER COLUMN container_size TYPE INTEGER
  USING (
    CASE
      WHEN container_size IS NULL THEN NULL
      WHEN container_size = '5 gal' THEN 5
      WHEN container_size = '3 gal' THEN 3
      WHEN container_size = '1 gal' THEN 1
      WHEN container_size ~ '^[0-9]+$' THEN container_size::INTEGER
      ELSE NULL
    END
  );

ALTER TABLE orders
  ADD CONSTRAINT orders_container_size_check
  CHECK (container_size IS NULL OR container_size IN (1, 3, 5));
