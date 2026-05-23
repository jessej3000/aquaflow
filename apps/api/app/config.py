from dataclasses import dataclass
import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env relative to apps/api so running from workspace root still works.
_API_ROOT = Path(__file__).resolve().parents[1]
_ENV_FILE = _API_ROOT / ".env"
load_dotenv(_ENV_FILE)


@dataclass(frozen=True)
class Settings:
    port: int
    database_url: str
    jwt_secret: str
    paymongo_secret_key: str
    paymongo_public_key: str
    paymongo_webhook_secret: str
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    smtp_from: str
    app_url: str


def get_settings() -> Settings:
    port_str = os.getenv("PORT", "4000")
    database_url = os.getenv("DATABASE_URL", "").strip()
    jwt_secret = os.getenv("JWT_SECRET", "").strip()

    if not database_url:
        raise RuntimeError("DATABASE_URL is required")

    if len(jwt_secret) < 32:
        raise RuntimeError("JWT_SECRET must be at least 32 characters")

    return Settings(
        port=int(port_str),
        database_url=database_url,
        jwt_secret=jwt_secret,
        paymongo_secret_key=os.getenv("PAYMONGO_SECRET_KEY", "").strip(),
        paymongo_public_key=os.getenv("PAYMONGO_PUBLIC_KEY", "").strip(),
        paymongo_webhook_secret=os.getenv("PAYMONGO_WEBHOOK_SECRET", "").strip(),
        smtp_host=os.getenv("SMTP_HOST", "").strip(),
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_user=os.getenv("SMTP_USER", "").strip(),
        smtp_password=os.getenv("SMTP_PASSWORD", "").strip(),
        smtp_from=os.getenv("SMTP_FROM", "noreply@watermaster.com").strip(),
        app_url=os.getenv("APP_URL", "http://localhost:5173").strip(),
    )


settings = get_settings()
