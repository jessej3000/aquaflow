from app.db import get_connection


def is_flag_enabled(key: str) -> bool:
    """Return True if the feature flag exists and is enabled. Defaults to False if not found."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT enabled FROM feature_flags WHERE key = %s",
                    (key,),
                )
                row = cur.fetchone()
        return bool(row["enabled"]) if row else False
    except Exception:
        return False


def get_all_flags() -> dict[str, bool]:
    """Return all feature flags as a {key: enabled} dict."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT key, enabled FROM feature_flags ORDER BY key")
                rows = cur.fetchall()
        return {r["key"]: bool(r["enabled"]) for r in rows}
    except Exception:
        return {}
