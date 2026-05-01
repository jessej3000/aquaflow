ALTER TABLE inventories
    ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity >= 0);

CREATE INDEX IF NOT EXISTS idx_inventories_capacity ON inventories(capacity);
