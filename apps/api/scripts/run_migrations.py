from pathlib import Path

from psycopg import connect

from app.config import settings


def run() -> None:
    migrations_dir = Path(__file__).resolve().parent.parent / "app" / "migrations"

    with connect(settings.database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    name TEXT PRIMARY KEY,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
        conn.commit()

        migration_files = sorted(migrations_dir.glob("*.sql"))

        for migration_file in migration_files:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT 1 FROM schema_migrations WHERE name = %s",
                    (migration_file.name,),
                )
                if cur.fetchone():
                    continue

                sql = migration_file.read_text(encoding="utf-8")

                cur.execute("BEGIN")
                cur.execute(sql)
                cur.execute(
                    "INSERT INTO schema_migrations (name) VALUES (%s)",
                    (migration_file.name,),
                )
                conn.commit()

                print(f"Applied migration: {migration_file.name}")

    print("Migrations complete")


if __name__ == "__main__":
    run()
