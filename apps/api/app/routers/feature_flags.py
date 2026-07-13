from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field

from app.db import get_connection
from app.lib.security import create_access_token, decode_token, verify_password
from app.lib.token_blocklist import is_token_revoked
from app.lib.feature_flags import get_all_flags

router = APIRouter(prefix="/ff", tags=["feature-flags"])


class FFLoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class FeatureFlagCreateRequest(BaseModel):
    key: str = Field(min_length=1)
    description: Optional[str] = None
    enabled: bool = False


class FeatureFlagUpdateRequest(BaseModel):
    description: Optional[str] = None
    enabled: Optional[bool] = None


def _require_thanos(authorization: Optional[str]) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization Bearer token is required",
        )

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization Bearer token is required",
        )

    if is_token_revoked(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    try:
        claims = decode_token(token)
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from ex

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT role FROM users WHERE id = %s AND is_active = TRUE",
                (user_id,),
            )
            user = cur.fetchone()

    if not user or user["role"] != "thanos":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized.",
        )


def _serialize_flag(row: Any) -> dict[str, Any]:
    return {
        "id": row["id"],
        "key": row["key"],
        "description": row["description"],
        "enabled": row["enabled"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


@router.get("/active")
def active_flags(authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    """Public-ish endpoint — any valid user token can read which flags are active."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ").strip()
    if is_token_revoked(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    try:
        decode_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"flags": get_all_flags()}


@router.post("/login")
def login(payload: FFLoginRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, tenant_id, email, password_hash, role
                FROM users
                WHERE email = LOWER(%s) AND is_active = TRUE AND role = 'thanos'
                LIMIT 1
                """,
                (payload.email,),
            )
            user = cur.fetchone()

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        user_id=str(user["id"]),
        email=user["email"],
        tenant_id=str(user["tenant_id"]),
    )

    return {"access_token": access_token}


@router.get("/flags")
def list_flags(authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    _require_thanos(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM feature_flags ORDER BY key ASC")
            rows = cur.fetchall()

    return {"flags": [_serialize_flag(r) for r in rows]}


@router.post("/flags", status_code=status.HTTP_201_CREATED)
def create_flag(
    payload: FeatureFlagCreateRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    _require_thanos(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM feature_flags WHERE key = %s",
                (payload.key,),
            )
            if cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A feature flag with this key already exists.",
                )

            cur.execute(
                """
                INSERT INTO feature_flags (key, description, enabled)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                (payload.key, payload.description, payload.enabled),
            )
            flag = cur.fetchone()
        conn.commit()

    return {"flag": _serialize_flag(flag)}


@router.put("/flags/{key}")
def update_flag(
    key: str,
    payload: FeatureFlagUpdateRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    _require_thanos(authorization)

    updates: list[str] = []
    params: list[Any] = []

    if payload.description is not None:
        updates.append("description = %s")
        params.append(payload.description)

    if payload.enabled is not None:
        updates.append("enabled = %s")
        params.append(payload.enabled)

    if not updates:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM feature_flags WHERE key = %s", (key,))
                flag = cur.fetchone()
        if not flag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature flag not found.",
            )
        return {"flag": _serialize_flag(flag)}

    updates.append("updated_at = NOW()")
    params.append(key)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE feature_flags SET {', '.join(updates)} WHERE key = %s RETURNING *",
                params,
            )
            flag = cur.fetchone()
        conn.commit()

    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature flag not found.",
        )

    return {"flag": _serialize_flag(flag)}


@router.delete("/flags/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flag(
    key: str,
    authorization: Optional[str] = Header(default=None),
) -> None:
    _require_thanos(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM feature_flags WHERE key = %s", (key,))
            if not cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Feature flag not found.",
                )
            cur.execute("DELETE FROM feature_flags WHERE key = %s", (key,))
        conn.commit()
