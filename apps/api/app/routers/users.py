from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.db import get_connection
from app.lib.security import decode_token, hash_password
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/users", tags=["users"])

USER_ROLE_PATTERN = r"^(admin|staff|assistant|delivery)$"


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None
    role: str = Field(default="staff", pattern=USER_ROLE_PATTERN)
    branch_id: Optional[int] = None


class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = Field(default=None, pattern=USER_ROLE_PATTERN)
    is_active: Optional[bool] = None
    branch_id: Optional[int] = None


def _get_current_user(authorization: Optional[str]) -> dict[str, Any]:
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
    tenant_id = claims.get("tenant_id")
    if not user_id or not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, tenant_id, role FROM users WHERE id = %s AND is_active = TRUE",
                (user_id,),
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {"id": str(user["id"]), "tenant_id": str(user["tenant_id"]), "role": user["role"]}


def _serialize_user(row: Any) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "tenant_id": str(row["tenant_id"]),
        "email": row["email"],
        "full_name": row["full_name"],
        "role": row["role"],
        "is_active": row["is_active"],
        "created_at": row["created_at"],
        "branch_name": row.get("branch_name"),
    }


@router.get("")
def list_users(
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            if current["role"] == "admin":
                # Admin sees tenant users except their own account.
                cur.execute(
                    """
                    SELECT u.id, u.tenant_id, u.email, u.full_name, u.role, u.is_active, u.created_at, b.name as branch_name
                    FROM users u
                    LEFT JOIN branches b ON u.branch_id = b.id
                    WHERE u.tenant_id = %s
                      AND u.id <> %s
                    ORDER BY u.created_at ASC
                    """,
                    (current["tenant_id"], current["id"]),
                )
            else:
                # Non-admin users don't list user records in the management table.
                cur.execute(
                    """
                    SELECT u.id, u.tenant_id, u.email, u.full_name, u.role, u.is_active, u.created_at, b.name as branch_name
                    FROM users u
                    LEFT JOIN branches b ON u.branch_id = b.id
                    WHERE 1 = 0
                    """
                )
            rows = cur.fetchall()

    return {"users": [_serialize_user(r) for r in rows]}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(
    payload: CreateUserRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current = _get_current_user(authorization)

    if current["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create users.",
        )

    normalized_email = payload.email.lower()
    password_hash = hash_password(payload.password)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM users WHERE tenant_id = %s AND email = %s AND is_active = TRUE LIMIT 1",
                (current["tenant_id"], normalized_email),
            )
            if cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists in this tenant.",
                )

            cur.execute(
                """
                INSERT INTO users (tenant_id, email, password_hash, full_name, role, branch_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, tenant_id, email, full_name, role, is_active, created_at, branch_id
                """,
                (
                    current["tenant_id"],
                    normalized_email,
                    password_hash,
                    payload.full_name,
                    payload.role,
                    payload.branch_id,
                ),
            )
            user = cur.fetchone()
        conn.commit()

    return {"user": _serialize_user(user)}


@router.put("/{user_id}")
def update_user(
    user_id: str,
    payload: UpdateUserRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current = _get_current_user(authorization)

    if current["role"] != "admin" and current["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update other users.",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, tenant_id FROM users WHERE id = %s AND tenant_id = %s",
                (user_id, current["tenant_id"]),
            )
            if not cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found.",
                )

            updates: list[str] = []
            params: list[Any] = []

            if payload.full_name is not None:
                updates.append("full_name = %s")
                params.append(payload.full_name)

            if payload.role is not None and current["role"] == "admin":
                updates.append("role = %s")
                params.append(payload.role)

            if payload.is_active is not None and current["role"] == "admin":
                updates.append("is_active = %s")
                params.append(payload.is_active)

            if payload.branch_id is not None and current["role"] == "admin":
                updates.append("branch_id = %s")
                params.append(payload.branch_id)

            if not updates:
                cur.execute(
                    """
                    SELECT id, tenant_id, email, full_name, role, is_active, created_at, branch_id
                    FROM users WHERE id = %s
                    """,
                    (user_id,),
                )
                return {"user": _serialize_user(cur.fetchone())}

            updates.append("updated_at = NOW()")
            params.append(user_id)

            cur.execute(
                f"UPDATE users SET {', '.join(updates)} WHERE id = %s "
                "RETURNING id, tenant_id, email, full_name, role, is_active, created_at, branch_id",
                params,
            )
            user = cur.fetchone()
        conn.commit()

    return {"user": _serialize_user(user)}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    authorization: Optional[str] = Header(default=None),
) -> None:
    current = _get_current_user(authorization)

    if current["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users.",
        )

    if current["id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM users WHERE id = %s AND tenant_id = %s",
                (user_id, current["tenant_id"]),
            )
            if not cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found.",
                )

            cur.execute(
                "UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = %s",
                (user_id,),
            )
        conn.commit()
