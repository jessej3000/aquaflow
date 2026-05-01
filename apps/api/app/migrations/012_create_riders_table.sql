CREATE TABLE riders (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        TEXT,
    contact     TEXT,
    vehicle     TEXT,
    ranking     INT NOT NULL DEFAULT 0,
    joined      DATE,
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    deleted     BOOLEAN NOT NULL DEFAULT FALSE,
    geolocation TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
