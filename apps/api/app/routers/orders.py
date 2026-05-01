from datetime import date, datetime
from typing import Any, Literal, Optional

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel, Field
from psycopg.errors import UniqueViolation

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/orders", tags=["orders"])


class CreateOrderRequest(BaseModel):
    order_number: str = Field(min_length=1, max_length=100)

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    delivery_address: Optional[str] = None
    contact_number: Optional[str] = None

    order_type: str = Field(pattern=r"^(delivery|pickup|walk-in)$")
    container_type: Optional[str] = Field(default=None, pattern=r"^(round|slim|distilled|alkaline)$")
    container_size: Optional[Literal[1, 3, 5]] = None
    quantity: int = Field(default=0, ge=0)
    borrowed_containers: int = Field(default=0, ge=0)
    returned_containers: int = Field(default=0, ge=0)

    unit_price: float = Field(default=0, ge=0)
    subtotal: float = Field(default=0, ge=0)
    discount: float = Field(default=0, ge=0)
    delivery_fee: float = Field(default=0, ge=0)
    total_amount: float = Field(default=0, ge=0)
    amount_paid: float = Field(default=0, ge=0)
    change_amount: float = Field(default=0, ge=0)
    payment_method: Optional[str] = Field(default=None, pattern=r"^(cash|gcash|maya|bank-transfer)$")
    payment_status: str = Field(default="unpaid", pattern=r"^(unpaid|partial|paid)$")

    delivery_date: Optional[date] = None
    delivery_time_slot: Optional[str] = Field(default=None, pattern=r"^(morning|afternoon|evening)$")
    rider_id: Optional[int] = None
    delivery_notes: Optional[str] = None
    delivered_at: Optional[datetime] = None

    order_status: str = Field(default="pending", pattern=r"^(pending|confirmed|out-for-delivery|delivered|cancelled)$")
    cancellation_reason: Optional[str] = None
    priority_flag: bool = False

    branch_id: Optional[int] = None


class UpdateOrderRequest(BaseModel):
    order_number: Optional[str] = Field(default=None, min_length=1, max_length=100)

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    delivery_address: Optional[str] = None
    contact_number: Optional[str] = None

    order_type: Optional[str] = Field(default=None, pattern=r"^(delivery|pickup|walk-in)$")
    container_type: Optional[str] = Field(default=None, pattern=r"^(round|slim|distilled|alkaline)$")
    container_size: Optional[Literal[1, 3, 5]] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    borrowed_containers: Optional[int] = Field(default=None, ge=0)
    returned_containers: Optional[int] = Field(default=None, ge=0)

    unit_price: Optional[float] = Field(default=None, ge=0)
    subtotal: Optional[float] = Field(default=None, ge=0)
    discount: Optional[float] = Field(default=None, ge=0)
    delivery_fee: Optional[float] = Field(default=None, ge=0)
    total_amount: Optional[float] = Field(default=None, ge=0)
    amount_paid: Optional[float] = Field(default=None, ge=0)
    change_amount: Optional[float] = Field(default=None, ge=0)
    payment_method: Optional[str] = Field(default=None, pattern=r"^(cash|gcash|maya|bank-transfer)$")
    payment_status: Optional[str] = Field(default=None, pattern=r"^(unpaid|partial|paid)$")

    delivery_date: Optional[date] = None
    delivery_time_slot: Optional[str] = Field(default=None, pattern=r"^(morning|afternoon|evening)$")
    rider_id: Optional[int] = None
    delivery_notes: Optional[str] = None
    delivered_at: Optional[datetime] = None

    order_status: Optional[str] = Field(default=None, pattern=r"^(pending|confirmed|out-for-delivery|delivered|cancelled)$")
    cancellation_reason: Optional[str] = None
    priority_flag: Optional[bool] = None

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


def _ensure_tenant_exists(conn: Any, tenant_id: str, user_id: str) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO tenants (id, user_id)
            VALUES (%s, %s)
            ON CONFLICT (id) DO NOTHING
            """,
            (tenant_id, user_id),
        )


def _fetch_order(conn: Any, order_id: int, user_id: str) -> Optional[Any]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT o.id, o.order_number,
                   o.customer_id, o.customer_name, o.delivery_address, o.contact_number,
                   o.order_type, o.container_type, o.container_size,
                   o.quantity, o.borrowed_containers, o.returned_containers,
                   o.unit_price, o.subtotal, o.discount, o.delivery_fee,
                   o.total_amount, o.amount_paid, o.change_amount,
                   o.payment_method, o.payment_status,
                   o.delivery_date, o.delivery_time_slot, o.rider_id,
                   o.delivery_notes, o.delivered_at,
                   o.order_status, o.cancellation_reason, o.priority_flag,
                   o.created_at, o.updated_at, o.created_by,
                   o.branch_id, b.name AS branch_name,
                   o.tenant_id,
                   r.name AS rider_name
            FROM orders o
            JOIN branches b ON b.id = o.branch_id
            LEFT JOIN riders r ON r.id = o.rider_id
            WHERE o.id = %s
              AND b.user_id = %s
              AND b.status IN ('active', 'inactive')
                            AND o.deleted = FALSE
            LIMIT 1
            """,
            (order_id, user_id),
        )
        return cur.fetchone()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: CreateOrderRequest,
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
            _ensure_tenant_exists(conn, current_user["tenant_id"], current_user["id"])

            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO orders (
                        order_number,
                        customer_id, customer_name, delivery_address, contact_number,
                        order_type, container_type, container_size,
                        quantity, borrowed_containers, returned_containers,
                        unit_price, subtotal, discount, delivery_fee,
                        total_amount, amount_paid, change_amount,
                        payment_method, payment_status,
                        delivery_date, delivery_time_slot, rider_id,
                        delivery_notes, delivered_at,
                        order_status, cancellation_reason, priority_flag,
                        created_by, branch_id, tenant_id
                    )
                    VALUES (
                        %s,
                        %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s,
                        %s, %s, %s,
                        %s, %s,
                        %s, %s, %s,
                        %s, %s, %s
                    )
                    RETURNING id
                    """,
                    (
                        payload.order_number,
                        payload.customer_id,
                        payload.customer_name,
                        payload.delivery_address,
                        payload.contact_number,
                        payload.order_type,
                        payload.container_type,
                        payload.container_size,
                        payload.quantity,
                        payload.borrowed_containers,
                        payload.returned_containers,
                        payload.unit_price,
                        payload.subtotal,
                        payload.discount,
                        payload.delivery_fee,
                        payload.total_amount,
                        payload.amount_paid,
                        payload.change_amount,
                        payload.payment_method,
                        payload.payment_status,
                        payload.delivery_date,
                        payload.delivery_time_slot,
                        payload.rider_id,
                        payload.delivery_notes,
                        payload.delivered_at,
                        payload.order_status,
                        payload.cancellation_reason,
                        payload.priority_flag,
                        current_user["id"],
                        branch_id,
                        current_user["tenant_id"],
                    ),
                )
                row = cur.fetchone()
            conn.commit()
            order = _fetch_order(conn, row["id"], current_user["id"])
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order number already exists",
        ) from ex

    return {"order": order}


@router.get("")
def list_orders(
    authorization: Optional[str] = Header(default=None),
    branch_id: Optional[int] = Query(default=None),
    include_deleted: bool = Query(default=False),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    if current_user["role"] != "admin" and branch_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="branch_id is required for non-admin users",
        )

    if include_deleted and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can include deleted orders",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            sql = """
                  SELECT o.id, o.order_number,
                       o.customer_id, o.customer_name, o.delivery_address, o.contact_number,
                       o.order_type, o.container_type, o.container_size,
                       o.quantity, o.borrowed_containers, o.returned_containers,
                       o.unit_price, o.subtotal, o.discount, o.delivery_fee,
                       o.total_amount, o.amount_paid, o.change_amount,
                       o.payment_method, o.payment_status,
                       o.delivery_date, o.delivery_time_slot, o.rider_id,
                       o.delivery_notes, o.delivered_at,
                       o.order_status, o.cancellation_reason, o.priority_flag,
                      o.deleted,
                       o.created_at, o.updated_at, o.created_by,
                       o.branch_id, b.name AS branch_name,
                       o.tenant_id,
                       r.name AS rider_name
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                LEFT JOIN riders r ON r.id = o.rider_id
                WHERE b.user_id = %s
                  AND b.status IN ('active', 'inactive')
            """
            params: list[Any] = [current_user["id"]]

            if not include_deleted:
                sql += " AND o.deleted = FALSE"

            if branch_id is not None:
                sql += " AND o.branch_id = %s"
                params.append(branch_id)

            sql += " ORDER BY o.id DESC"

            cur.execute(sql, tuple(params))
            orders = cur.fetchall()

    return {"orders": orders}


@router.get("/{order_id}")
def get_order(
    order_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        order = _fetch_order(conn, order_id, current_user["id"])

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return {"order": order}


@router.put("/{order_id}")
def update_order(
    order_id: int,
    payload: UpdateOrderRequest,
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

    if payload.order_number is not None:
        updates.append("order_number = %s")
        values.append(payload.order_number)
    if payload.customer_id is not None:
        updates.append("customer_id = %s")
        values.append(payload.customer_id)
    if payload.customer_name is not None:
        updates.append("customer_name = %s")
        values.append(payload.customer_name)
    if payload.delivery_address is not None:
        updates.append("delivery_address = %s")
        values.append(payload.delivery_address)
    if payload.contact_number is not None:
        updates.append("contact_number = %s")
        values.append(payload.contact_number)
    if payload.order_type is not None:
        updates.append("order_type = %s")
        values.append(payload.order_type)
    if payload.container_type is not None:
        updates.append("container_type = %s")
        values.append(payload.container_type)
    if payload.container_size is not None:
        updates.append("container_size = %s")
        values.append(payload.container_size)
    if payload.quantity is not None:
        updates.append("quantity = %s")
        values.append(payload.quantity)
    if payload.borrowed_containers is not None:
        updates.append("borrowed_containers = %s")
        values.append(payload.borrowed_containers)
    if payload.returned_containers is not None:
        updates.append("returned_containers = %s")
        values.append(payload.returned_containers)
    if payload.unit_price is not None:
        updates.append("unit_price = %s")
        values.append(payload.unit_price)
    if payload.subtotal is not None:
        updates.append("subtotal = %s")
        values.append(payload.subtotal)
    if payload.discount is not None:
        updates.append("discount = %s")
        values.append(payload.discount)
    if payload.delivery_fee is not None:
        updates.append("delivery_fee = %s")
        values.append(payload.delivery_fee)
    if payload.total_amount is not None:
        updates.append("total_amount = %s")
        values.append(payload.total_amount)
    if payload.amount_paid is not None:
        updates.append("amount_paid = %s")
        values.append(payload.amount_paid)
    if payload.change_amount is not None:
        updates.append("change_amount = %s")
        values.append(payload.change_amount)
    if payload.payment_method is not None:
        updates.append("payment_method = %s")
        values.append(payload.payment_method)
    if payload.payment_status is not None:
        updates.append("payment_status = %s")
        values.append(payload.payment_status)
    if payload.delivery_date is not None:
        updates.append("delivery_date = %s")
        values.append(payload.delivery_date)
    if payload.delivery_time_slot is not None:
        updates.append("delivery_time_slot = %s")
        values.append(payload.delivery_time_slot)
    if payload.rider_id is not None:
        updates.append("rider_id = %s")
        values.append(payload.rider_id)
    if payload.delivery_notes is not None:
        updates.append("delivery_notes = %s")
        values.append(payload.delivery_notes)
    if payload.delivered_at is not None:
        updates.append("delivered_at = %s")
        values.append(payload.delivered_at)
    if payload.order_status is not None:
        updates.append("order_status = %s")
        values.append(payload.order_status)
    if payload.cancellation_reason is not None:
        updates.append("cancellation_reason = %s")
        values.append(payload.cancellation_reason)
    if payload.priority_flag is not None:
        updates.append("priority_flag = %s")
        values.append(payload.priority_flag)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    updates.append("updated_at = NOW()")
    values.extend([order_id, current_user["id"]])

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    UPDATE orders o
                    SET {", ".join(updates)}
                    FROM branches b
                    WHERE o.id = %s
                      AND b.id = o.branch_id
                      AND b.user_id = %s
                      AND b.status IN ('active', 'inactive')
                                            AND o.deleted = FALSE
                    RETURNING o.id
                    """,
                    tuple(values),
                )
                row = cur.fetchone()
            conn.commit()
            order = _fetch_order(conn, row["id"], current_user["id"]) if row else None
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order number already exists",
        ) from ex

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return {"order": order}


@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                                UPDATE orders o
                                SET deleted = TRUE, updated_at = NOW()
                                FROM branches b
                WHERE o.id = %s
                  AND b.id = o.branch_id
                  AND b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                                    AND o.deleted = FALSE
                RETURNING o.id
                """,
                (order_id, current_user["id"]),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return {"message": "Order deleted"}
