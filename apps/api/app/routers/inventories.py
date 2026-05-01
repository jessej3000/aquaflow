from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel, Field
from psycopg.errors import UniqueViolation

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/inventories", tags=["inventories"])


class CreateInventoryRequest(BaseModel):
    branch_id: Optional[int] = None
    code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    supplier: Optional[str] = None
    quantity: int = Field(default=0, ge=0)
    capacity: int = Field(default=0, ge=0)
    unit_cost: float = Field(default=0.0, ge=0)
    selling_price: float = Field(default=0.0, ge=0)
    status: str = Field(default="active", pattern=r"^(active|inactive)$")


class UpdateInventoryRequest(BaseModel):
    branch_id: Optional[int] = None
    code: Optional[str] = Field(default=None, min_length=1, max_length=50)
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    capacity: Optional[int] = Field(default=None, ge=0)
    unit_cost: Optional[float] = Field(default=None, ge=0)
    selling_price: Optional[float] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, pattern=r"^(active|inactive)$")


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
                SELECT id, role
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

    return {"id": str(user["id"]), "role": user["role"]}


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
def create_inventory(
    payload: CreateInventoryRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    branch_id = _resolve_branch_id_for_create(
        user_id=current_user["id"],
        role=current_user["role"],
        requested_branch_id=payload.branch_id,
    )

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO inventories (branch_id, code, name, description, supplier, quantity, capacity, unit_cost, selling_price, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, branch_id, code, name, description, supplier, quantity, capacity, unit_cost, selling_price, status, created_at, updated_at
                    """,
                    (
                        branch_id,
                        payload.code,
                        payload.name,
                        payload.description,
                        payload.supplier,
                        payload.quantity,
                        payload.capacity,
                        payload.unit_cost,
                        payload.selling_price,
                        payload.status,
                    ),
                )
                inventory = cur.fetchone()
            conn.commit()
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Inventory code already exists",
        ) from ex

    return {"inventory": inventory}


@router.get("")
def list_inventories(
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
                SELECT i.id, i.branch_id, b.name AS branch_name, i.code, i.name,
                       i.description, i.supplier, i.quantity, i.capacity, i.unit_cost, i.selling_price, i.status, i.created_at, i.updated_at
                FROM inventories i
                JOIN branches b ON b.id = i.branch_id
                WHERE b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                  AND i.deleted = FALSE
            """
            params: list[Any] = [current_user["id"]]

            if branch_id is not None:
                sql += " AND i.branch_id = %s"
                params.append(branch_id)

            sql += " ORDER BY i.id ASC"

            cur.execute(sql, tuple(params))
            inventories = cur.fetchall()

    return {"inventories": inventories}


@router.get("/{inventory_id}")
def get_inventory(
    inventory_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT i.id, i.branch_id, b.name AS branch_name, i.code, i.name,
                       i.description, i.supplier, i.quantity, i.capacity, i.unit_cost, i.selling_price, i.status, i.created_at, i.updated_at
                FROM inventories i
                JOIN branches b ON b.id = i.branch_id
                WHERE i.id = %s
                  AND b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                  AND i.deleted = FALSE
                LIMIT 1
                """,
                (inventory_id, current_user["id"]),
            )
            inventory = cur.fetchone()

    if not inventory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory not found")

    return {"inventory": inventory}


@router.put("/{inventory_id}")
def update_inventory(
    inventory_id: int,
    payload: UpdateInventoryRequest,
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
    if payload.description is not None:
        updates.append("description = %s")
        values.append(payload.description)
    if payload.supplier is not None:
        updates.append("supplier = %s")
        values.append(payload.supplier)
    if payload.quantity is not None:
        updates.append("quantity = %s")
        values.append(payload.quantity)
    if payload.unit_cost is not None:
        updates.append("unit_cost = %s")
        values.append(payload.unit_cost)
    if payload.capacity is not None:
        updates.append("capacity = %s")
        values.append(payload.capacity)
    if payload.selling_price is not None:
        updates.append("selling_price = %s")
        values.append(payload.selling_price)
    if payload.status is not None:
        updates.append("status = %s")
        values.append(payload.status)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    updates.append("updated_at = NOW()")
    values.extend([inventory_id, current_user["id"]])

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    UPDATE inventories i
                    SET {", ".join(updates)}
                    FROM branches b
                    WHERE i.id = %s
                      AND b.id = i.branch_id
                      AND b.user_id = %s
                      AND b.status IN ('active', 'inactive')
                      AND i.deleted = FALSE
                    RETURNING i.id, i.branch_id, b.name AS branch_name, i.code, i.name,
                              i.description, i.supplier, i.quantity, i.capacity, i.unit_cost, i.selling_price, i.status, i.created_at, i.updated_at
                    """,
                    tuple(values),
                )
                inventory = cur.fetchone()
            conn.commit()
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Inventory code already exists",
        ) from ex

    if not inventory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory not found")

    return {"inventory": inventory}


@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE inventories i
                SET deleted = TRUE, updated_at = NOW()
                FROM branches b
                WHERE i.id = %s
                  AND b.id = i.branch_id
                  AND b.user_id = %s
                  AND i.deleted = FALSE
                RETURNING i.id
                """,
                (inventory_id, current_user["id"]),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory not found")

    return {"message": "Inventory deleted"}
