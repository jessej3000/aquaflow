from datetime import date
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


class CreateMaintenanceRequest(BaseModel):
    branch_id: Optional[int] = None
    code: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1)
    supplier: Optional[str] = None
    contact: Optional[str] = None
    expiration_days: int = Field(default=0, ge=0)
    date_replaced: Optional[date] = None
    user_id: Optional[str] = None


class UpdateMaintenanceRequest(BaseModel):
    branch_id: Optional[int] = None
    code: Optional[str] = Field(default=None, min_length=1, max_length=20)
    name: Optional[str] = None
    supplier: Optional[str] = None
    contact: Optional[str] = None
    expiration_days: Optional[int] = Field(default=None, ge=0)
    date_replaced: Optional[date] = None
    user_id: Optional[str] = None


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
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, role, tenant_id
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
        "id": str(user["id"]),
        "role": user["role"],
        "tenant_id": str(user["tenant_id"]),
    }


def _resolve_branch_id_for_create(user_id: str, role: str, requested_branch_id: Optional[int]) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            if requested_branch_id is not None:
                cur.execute(
                    """
                    SELECT id
                    FROM branches
                    WHERE id = %s
                      AND user_id = %s
                      AND status IN ('active', 'inactive')
                    LIMIT 1
                    """,
                    (requested_branch_id, user_id),
                )
                branch = cur.fetchone()
                if not branch:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Branch not found",
                    )
                return int(branch["id"])

            if role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="branch_id is required for non-admin users",
                )

            cur.execute(
                """
                SELECT id
                FROM branches
                WHERE user_id = %s
                  AND status IN ('active', 'inactive')
                ORDER BY id ASC
                LIMIT 1
                """,
                (user_id,),
            )
            branch = cur.fetchone()

    if not branch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active branch found for this user",
        )

    return int(branch["id"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_maintenance(
    payload: CreateMaintenanceRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    branch_id = _resolve_branch_id_for_create(
        user_id=current_user["id"],
        role=current_user["role"],
        requested_branch_id=payload.branch_id,
    )
    user_id = payload.user_id or current_user["id"]

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO maintenance (branch_id, code, name, supplier, contact, expiration_days, date_replaced, user_id, tenant_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, branch_id, code, name, supplier, contact, expiration_days, date_replaced, user_id, tenant_id
                """,
                (
                    branch_id,
                    payload.code,
                    payload.name,
                    payload.supplier,
                    payload.contact,
                    payload.expiration_days,
                    payload.date_replaced,
                    user_id,
                    current_user["tenant_id"],
                ),
            )
            maintenance = cur.fetchone()
        conn.commit()

    return {"maintenance": maintenance}


@router.get("")
def list_maintenance(
    authorization: Optional[str] = Header(default=None),
    branch_id: Optional[int] = Query(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    if current_user["role"] != "admin" and branch_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="branch_id is required for non-admin users",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            sql = """
                SELECT m.id, m.branch_id, b.name AS branch_name, m.code, m.name, m.supplier,
                       m.contact, m.expiration_days, m.date_replaced, m.user_id,
                       u.full_name AS user_name, m.tenant_id
                FROM maintenance m
                JOIN branches b ON b.id = m.branch_id
                LEFT JOIN users u ON u.id = m.user_id
                WHERE b.user_id = %s
                  AND b.status IN ('active', 'inactive')
            """
            params: list[Any] = [current_user["id"]]

            if branch_id is not None:
                sql += " AND m.branch_id = %s"
                params.append(branch_id)

            sql += " ORDER BY m.id ASC"

            cur.execute(sql, tuple(params))
            maintenances = cur.fetchall()

    return {"maintenance": maintenances}


@router.get("/{maintenance_id}")
def get_maintenance(
    maintenance_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT m.id, m.branch_id, b.name AS branch_name, m.code, m.name, m.supplier,
                       m.contact, m.expiration_days, m.date_replaced, m.user_id,
                       u.full_name AS user_name, m.tenant_id
                FROM maintenance m
                JOIN branches b ON b.id = m.branch_id
                LEFT JOIN users u ON u.id = m.user_id
                WHERE m.id = %s
                  AND b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                LIMIT 1
                """,
                (maintenance_id, current_user["id"]),
            )
            maintenance = cur.fetchone()

    if not maintenance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance item not found")

    return {"maintenance": maintenance}


@router.put("/{maintenance_id}")
def update_maintenance(
    maintenance_id: int,
    payload: UpdateMaintenanceRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    updates: list[str] = []
    values: list[Any] = []

    if payload.branch_id is not None:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id
                    FROM branches
                    WHERE id = %s
                      AND user_id = %s
                      AND status IN ('active', 'inactive')
                    LIMIT 1
                    """,
                    (payload.branch_id, current_user["id"]),
                )
                branch = cur.fetchone()
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Branch not found",
            )
        updates.append("branch_id = %s")
        values.append(payload.branch_id)

    if payload.code is not None:
        updates.append("code = %s")
        values.append(payload.code)
    if payload.name is not None:
        updates.append("name = %s")
        values.append(payload.name)
    if payload.supplier is not None:
        updates.append("supplier = %s")
        values.append(payload.supplier)
    if payload.contact is not None:
        updates.append("contact = %s")
        values.append(payload.contact)
    if payload.expiration_days is not None:
        updates.append("expiration_days = %s")
        values.append(payload.expiration_days)
    if payload.date_replaced is not None:
        updates.append("date_replaced = %s")
        values.append(payload.date_replaced)
    if payload.user_id is not None:
        updates.append("user_id = %s")
        values.append(payload.user_id)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    values.extend([maintenance_id, current_user["id"]])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                UPDATE maintenance m
                SET {', '.join(updates)}
                FROM branches b
                WHERE m.id = %s
                  AND b.id = m.branch_id
                  AND b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                RETURNING m.id, m.branch_id, b.name AS branch_name, m.code, m.name, m.supplier,
                          m.contact, m.expiration_days, m.date_replaced, m.user_id,
                          (SELECT full_name FROM users u WHERE u.id = m.user_id) AS user_name, m.tenant_id
                """,
                tuple(values),
            )
            maintenance = cur.fetchone()
        conn.commit()

    if not maintenance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance item not found")

    return {"maintenance": maintenance}


@router.delete("/{maintenance_id}")
def delete_maintenance(
    maintenance_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM maintenance m
                USING branches b
                WHERE m.id = %s
                  AND b.id = m.branch_id
                  AND b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                RETURNING m.id
                """,
                (maintenance_id, current_user["id"]),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance item not found")

    return {"message": "Maintenance record deleted"}
