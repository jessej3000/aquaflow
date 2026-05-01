CREATE TABLE IF NOT EXISTS customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code CHAR(8) NOT NULL UNIQUE CHECK (code ~ '^[A-Za-z0-9]{8}$'),
  name TEXT,
  address TEXT,
  contact TEXT,
  geolocation TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);
