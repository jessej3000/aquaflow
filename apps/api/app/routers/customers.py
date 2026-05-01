from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel, Field
from psycopg.errors import UniqueViolation

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/customers", tags=["customers"])


class CreateCustomerRequest(BaseModel):
    branch_id: Optional[int] = None
    code: str = Field(min_length=8, max_length=8, pattern=r"^[A-Za-z0-9]{8}$")
    name: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None
    geolocation: Optional[str] = None
    status: str = Field(default="active", pattern=r"^(active|inactive)$")


class UpdateCustomerRequest(BaseModel):
    branch_id: Optional[int] = None
    code: Optional[str] = Field(default=None, min_length=8, max_length=8, pattern=r"^[A-Za-z0-9]{8}$")
    name: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None
    geolocation: Optional[str] = None
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
def create_customer(
    payload: CreateCustomerRequest,
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
                    INSERT INTO customers (branch_id, code, name, address, contact, geolocation, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, branch_id, code, name, address, contact, geolocation, status
                    """,
                    (
                        branch_id,
                        payload.code,
                        payload.name,
                        payload.address,
                        payload.contact,
                        payload.geolocation,
                        payload.status,
                    ),
                )
                customer = cur.fetchone()
            conn.commit()
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer code already exists",
        ) from ex

    return {"customer": customer}


@router.get("")
def list_customers(
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
                SELECT c.id, c.branch_id, c.code, c.name, c.address, c.contact, c.geolocation, c.status
                FROM customers c
                JOIN branches b ON b.id = c.branch_id
                WHERE b.user_id = %s
                  AND b.status IN ('active', 'inactive')
            """
            params: list[Any] = [current_user["id"]]

            if branch_id is not None:
                sql += " AND c.branch_id = %s"
                params.append(branch_id)

            sql += " ORDER BY c.id ASC"

            cur.execute(sql, tuple(params))
            customers = cur.fetchall()

    return {"customers": customers}


@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT c.id, c.branch_id, c.code, c.name, c.address, c.contact, c.geolocation, c.status
                FROM customers c
                JOIN branches b ON b.id = c.branch_id
                WHERE c.id = %s
                  AND b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                LIMIT 1
                """,
                (customer_id, current_user["id"]),
            )
            customer = cur.fetchone()

    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    return {"customer": customer}


@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    payload: UpdateCustomerRequest,
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
    if payload.address is not None:
        updates.append("address = %s")
        values.append(payload.address)
    if payload.contact is not None:
        updates.append("contact = %s")
        values.append(payload.contact)
    if payload.geolocation is not None:
        updates.append("geolocation = %s")
        values.append(payload.geolocation)
    if payload.status is not None:
        updates.append("status = %s")
        values.append(payload.status)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    values.extend([customer_id, current_user["id"]])

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                                        UPDATE customers c
                                        SET {", ".join(updates)}
                                        FROM branches b
                                        WHERE c.id = %s
                                            AND b.id = c.branch_id
                                            AND b.user_id = %s
                                            AND b.status IN ('active', 'inactive')
                                        RETURNING c.id, c.branch_id, c.code, c.name, c.address, c.contact, c.geolocation, c.status
                    """,
                    tuple(values),
                )
                customer = cur.fetchone()
            conn.commit()
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer code already exists",
        ) from ex

    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    return {"customer": customer}


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM customers c
                USING branches b
                WHERE c.id = %s
                  AND b.id = c.branch_id
                  AND b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                RETURNING c.id
                """,
                (customer_id, current_user["id"]),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    return {"message": "Customer deleted"}
