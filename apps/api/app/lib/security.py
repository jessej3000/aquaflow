from datetime import datetime, timezone
from typing import Any

import bcrypt
import jwt

from app.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def create_access_token(*, user_id: str, email: str, tenant_id: str) -> str:
    now = datetime.now(tz=timezone.utc)
    exp = int(now.timestamp()) + 3600
    payload: dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "tenant_id": tenant_id,
        "iat": int(now.timestamp()),
        "exp": exp,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
