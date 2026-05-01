import uuid
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from psycopg.errors import UniqueViolation

from app.db import get_connection
from app.lib.security import create_access_token, decode_token, hash_password, verify_password
from app.lib.token_blocklist import is_token_revoked, revoke_token

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None


class SigninRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


def _get_bearer_token(authorization: Optional[str]) -> str:
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
    return token


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest) -> dict[str, Any]:
    tenant_id = str(uuid.uuid4())
    normalized_email = payload.email.lower()
    password_hash = hash_password(payload.password)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT 1
                    FROM users
                    WHERE email = %s AND is_active = TRUE
                    LIMIT 1
                    """,
                    (normalized_email,),
                )
                if cur.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email is already registered",
                    )

                cur.execute(
                    """
                    INSERT INTO users (tenant_id, email, password_hash, full_name)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, tenant_id, email, full_name, role, created_at
                    """,
                    (tenant_id, normalized_email, password_hash, payload.full_name),
                )
                user = cur.fetchone()
            conn.commit()
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        ) from ex

    access_token = create_access_token(
        user_id=str(user["id"]),
        email=user["email"],
        tenant_id=str(user["tenant_id"]),
    )

    return {
        "user": {
            "id": str(user["id"]),
            "tenant_id": str(user["tenant_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "created_at": user["created_at"],
        },
        "access_token": access_token,
    }


@router.post("/signin")
def signin(payload: SigninRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, tenant_id, email, password_hash, full_name, role
                FROM users
                WHERE email = LOWER(%s) AND is_active = TRUE
                ORDER BY created_at DESC
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

            cur.execute(
                "UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = %s",
                (user["id"],),
            )
        conn.commit()

    access_token = create_access_token(
        user_id=str(user["id"]),
        email=user["email"],
        tenant_id=str(user["tenant_id"]),
    )

    return {
        "user": {
            "id": str(user["id"]),
            "tenant_id": str(user["tenant_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
        },
        "access_token": access_token,
    }


@router.get("/me")
def me(authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    token = _get_bearer_token(authorization)

    if is_token_revoked(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    try:
        claims = decode_token(token)
    except Exception as ex:  # pragma: no cover
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
                """
                SELECT id, tenant_id, email, full_name, role, created_at
                FROM users
                WHERE id = %s AND is_active = TRUE
                LIMIT 1
                """,
                (user_id,),
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "user": {
            "id": str(user["id"]),
            "tenant_id": str(user["tenant_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "created_at": user["created_at"],
        }
    }


@router.post("/logout")
def logout(authorization: Optional[str] = Header(default=None)) -> dict[str, str]:
    token = _get_bearer_token(authorization)

    try:
        claims = decode_token(token)
    except Exception as ex:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from ex

    exp = int(claims.get("exp", 0))

    if not is_token_revoked(token):
        revoke_token(token, exp)

    return {"message": "Logged out successfully"}
