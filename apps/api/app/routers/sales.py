from datetime import date, datetime
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel, Field
from psycopg.errors import UniqueViolation

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/sales", tags=["sales"])


class CreateSaleRequest(BaseModel):
    invoice_number: str = Field(min_length=1, max_length=100)
    order_id: Optional[int] = None

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None

    product_id: Optional[int] = None
    product_name: Optional[str] = None
    sku: Optional[str] = None
    quantity: int = Field(default=1, ge=1)
    unit_price: float = Field(default=0, ge=0)
    discount: float = Field(default=0, ge=0)

    subtotal: float = Field(default=0, ge=0)
    tax_rate: float = Field(default=0, ge=0)
    tax_amount: float = Field(default=0, ge=0)
    shipping_fee: float = Field(default=0, ge=0)
    total_amount: float = Field(default=0, ge=0)
    currency: str = Field(default="PHP", min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    payment_method: Optional[str] = None
    payment_status: str = Field(default="pending", pattern=r"^(pending|paid|refunded|partial|failed)$")

    salesperson_id: Optional[str] = None
    branch_id: Optional[int] = None
    channel: Optional[str] = Field(default=None, pattern=r"^(online|walk-in|phone|social|other)$")

    sale_date: Optional[datetime] = None
    due_date: Optional[date] = None
    sale_status: str = Field(default="pending", pattern=r"^(completed|cancelled|refunded|pending)$")

    notes: Optional[str] = None
    reference_number: Optional[str] = None


class UpdateSaleRequest(BaseModel):
    invoice_number: Optional[str] = Field(default=None, min_length=1, max_length=100)
    order_id: Optional[int] = None

    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None

    product_id: Optional[int] = None
    product_name: Optional[str] = None
    sku: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=1)
    unit_price: Optional[float] = Field(default=None, ge=0)
    discount: Optional[float] = Field(default=None, ge=0)

    subtotal: Optional[float] = Field(default=None, ge=0)
    tax_rate: Optional[float] = Field(default=None, ge=0)
    tax_amount: Optional[float] = Field(default=None, ge=0)
    shipping_fee: Optional[float] = Field(default=None, ge=0)
    total_amount: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    payment_method: Optional[str] = None
    payment_status: Optional[str] = Field(default=None, pattern=r"^(pending|paid|refunded|partial|failed)$")

    salesperson_id: Optional[str] = None
    branch_id: Optional[int] = None
    channel: Optional[str] = Field(default=None, pattern=r"^(online|walk-in|phone|social|other)$")

    sale_date: Optional[datetime] = None
    due_date: Optional[date] = None
    sale_status: Optional[str] = Field(default=None, pattern=r"^(completed|cancelled|refunded|pending)$")

    notes: Optional[str] = None
    reference_number: Optional[str] = None


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
                SELECT id, role, tenant_id, branch_id
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
        "branch_id": user["branch_id"],
    }


def _resolve_branch_id_for_create(
    user_id: str,
    role: str,
    tenant_id: str,
    assigned_branch_id: Optional[int],
    requested_branch_id: Optional[int],
) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            if role != "admin":
                if assigned_branch_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="branch_id is required for non-admin users",
                    )

                cur.execute(
                    """
                    SELECT b.id
                    FROM branches b
                    JOIN users u ON u.id = b.user_id
                    WHERE b.id = %s
                      AND u.tenant_id = %s
                      AND b.status IN ('active', 'inactive')
                    LIMIT 1
                    """,
                    (assigned_branch_id, tenant_id),
                )
                branch = cur.fetchone()
                if not branch:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Branch not found",
                    )
                return int(branch["id"])

            if requested_branch_id is not None:
                cur.execute(
                    """
                    SELECT b.id
                    FROM branches b
                    JOIN users u ON u.id = b.user_id
                    WHERE b.id = %s
                      AND u.tenant_id = %s
                      AND b.status IN ('active', 'inactive')
                    LIMIT 1
                    """,
                    (requested_branch_id, tenant_id),
                )
                branch = cur.fetchone()
                if not branch:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Branch not found",
                    )
                return int(branch["id"])

            cur.execute(
                """
                SELECT b.id
                FROM branches b
                JOIN users u ON u.id = b.user_id
                WHERE u.tenant_id = %s
                  AND b.status IN ('active', 'inactive')
                ORDER BY b.id ASC
                LIMIT 1
                """,
                (tenant_id,),
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


def _fetch_sale(conn: Any, sale_id: int, tenant_id: str) -> Optional[Any]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT s.id, s.invoice_number, s.order_id,
                   s.customer_id, s.customer_name, s.customer_email,
                   s.product_id, s.product_name, s.sku,
                   s.quantity, s.unit_price, s.discount, s.line_total,
                   s.subtotal, s.tax_rate, s.tax_amount, s.shipping_fee, s.total_amount,
                   s.currency, s.payment_method, s.payment_status,
                   s.salesperson_id, u.full_name AS salesperson_name,
                   s.branch_id, b.name AS branch_name,
                   s.channel,
                   s.sale_date, s.due_date, s.created_at, s.updated_at, s.sale_status,
                   s.notes, s.reference_number,
                   s.tenant_id, s.created_by
            FROM sales s
            JOIN branches b ON b.id = s.branch_id
                        JOIN users bu ON bu.id = b.user_id
            LEFT JOIN users u ON u.id = s.salesperson_id
            WHERE s.id = %s
                            AND bu.tenant_id = %s
              AND b.status IN ('active', 'inactive')
            LIMIT 1
            """,
                        (sale_id, tenant_id),
        )
        return cur.fetchone()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_sale(
    payload: CreateSaleRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    branch_id = _resolve_branch_id_for_create(
        user_id=current_user["id"],
        role=current_user["role"],
        tenant_id=current_user["tenant_id"],
        assigned_branch_id=current_user["branch_id"],
        requested_branch_id=payload.branch_id,
    )

    try:
        with get_connection() as conn:
            _ensure_tenant_exists(conn, current_user["tenant_id"], current_user["id"])

            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO sales (
                        invoice_number, order_id,
                        customer_id, customer_name, customer_email,
                        product_id, product_name, sku,
                        quantity, unit_price, discount,
                        subtotal, tax_rate, tax_amount, shipping_fee, total_amount,
                        currency, payment_method, payment_status,
                        salesperson_id, branch_id, channel,
                        sale_date, due_date, sale_status,
                        notes, reference_number,
                        tenant_id, created_by
                    )
                    VALUES (
                        %s, %s,
                        %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s,
                        COALESCE(%s, NOW()), %s, %s,
                        %s, %s,
                        %s, %s
                    )
                    RETURNING id
                    """,
                    (
                        payload.invoice_number,
                        payload.order_id,
                        payload.customer_id,
                        payload.customer_name,
                        payload.customer_email,
                        payload.product_id,
                        payload.product_name,
                        payload.sku,
                        payload.quantity,
                        payload.unit_price,
                        payload.discount,
                        payload.subtotal,
                        payload.tax_rate,
                        payload.tax_amount,
                        payload.shipping_fee,
                        payload.total_amount,
                        payload.currency,
                        payload.payment_method,
                        payload.payment_status,
                        payload.salesperson_id,
                        branch_id,
                        payload.channel,
                        payload.sale_date,
                        payload.due_date,
                        payload.sale_status,
                        payload.notes,
                        payload.reference_number,
                        current_user["tenant_id"],
                        current_user["id"],
                    ),
                )
                row = cur.fetchone()
            conn.commit()
            sale = _fetch_sale(conn, row["id"], current_user["tenant_id"])
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invoice number already exists",
        ) from ex

    return {"sale": sale}


@router.get("")
def list_sales(
    authorization: Optional[str] = Header(default=None),
    branch_id: Optional[int] = Query(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    if current_user["role"] != "admin":
        if current_user["branch_id"] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="branch_id is required for non-admin users",
            )
        if branch_id is not None and int(branch_id) != int(current_user["branch_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Non-admin users can only access their assigned branch",
            )
        branch_id = int(current_user["branch_id"])

    with get_connection() as conn:
        with conn.cursor() as cur:
            sql = """
                SELECT s.id, s.invoice_number, s.order_id,
                       s.customer_id, s.customer_name, s.customer_email,
                       s.product_id, s.product_name, s.sku,
                       s.quantity, s.unit_price, s.discount, s.line_total,
                       s.subtotal, s.tax_rate, s.tax_amount, s.shipping_fee, s.total_amount,
                       s.currency, s.payment_method, s.payment_status,
                       s.salesperson_id, u.full_name AS salesperson_name,
                       s.branch_id, b.name AS branch_name,
                       s.channel,
                       s.sale_date, s.due_date, s.created_at, s.updated_at, s.sale_status,
                       s.notes, s.reference_number,
                       s.tenant_id, s.created_by
                FROM sales s
                JOIN branches b ON b.id = s.branch_id
                JOIN users bu ON bu.id = b.user_id
                LEFT JOIN users u ON u.id = s.salesperson_id
                WHERE bu.tenant_id = %s
                  AND b.status IN ('active', 'inactive')
            """
            params: list[Any] = [current_user["tenant_id"]]

            if branch_id is not None:
                sql += " AND s.branch_id = %s"
                params.append(branch_id)

            sql += " ORDER BY s.id DESC"

            cur.execute(sql, tuple(params))
            sales = cur.fetchall()

    return {"sales": sales}


@router.get("/{sale_id}")
def get_sale(
    sale_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        sale = _fetch_sale(conn, sale_id, current_user["tenant_id"])

    if not sale:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")

    return {"sale": sale}


@router.put("/{sale_id}")
def update_sale(
    sale_id: int,
    payload: UpdateSaleRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    updates: list[str] = []
    values: list[Any] = []

    if payload.branch_id is not None and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can reassign sale branches",
        )

    if payload.branch_id is not None:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT b.id
                    FROM branches b
                    JOIN users u ON u.id = b.user_id
                    WHERE b.id = %s
                      AND u.tenant_id = %s
                      AND b.status IN ('active', 'inactive')
                    LIMIT 1
                    """,
                    (payload.branch_id, current_user["tenant_id"]),
                )
                branch = cur.fetchone()
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Branch not found",
            )
        updates.append("branch_id = %s")
        values.append(payload.branch_id)

    if payload.invoice_number is not None:
        updates.append("invoice_number = %s")
        values.append(payload.invoice_number)
    if payload.order_id is not None:
        updates.append("order_id = %s")
        values.append(payload.order_id)
    if payload.customer_id is not None:
        updates.append("customer_id = %s")
        values.append(payload.customer_id)
    if payload.customer_name is not None:
        updates.append("customer_name = %s")
        values.append(payload.customer_name)
    if payload.customer_email is not None:
        updates.append("customer_email = %s")
        values.append(payload.customer_email)
    if payload.product_id is not None:
        updates.append("product_id = %s")
        values.append(payload.product_id)
    if payload.product_name is not None:
        updates.append("product_name = %s")
        values.append(payload.product_name)
    if payload.sku is not None:
        updates.append("sku = %s")
        values.append(payload.sku)
    if payload.quantity is not None:
        updates.append("quantity = %s")
        values.append(payload.quantity)
    if payload.unit_price is not None:
        updates.append("unit_price = %s")
        values.append(payload.unit_price)
    if payload.discount is not None:
        updates.append("discount = %s")
        values.append(payload.discount)
    if payload.subtotal is not None:
        updates.append("subtotal = %s")
        values.append(payload.subtotal)
    if payload.tax_rate is not None:
        updates.append("tax_rate = %s")
        values.append(payload.tax_rate)
    if payload.tax_amount is not None:
        updates.append("tax_amount = %s")
        values.append(payload.tax_amount)
    if payload.shipping_fee is not None:
        updates.append("shipping_fee = %s")
        values.append(payload.shipping_fee)
    if payload.total_amount is not None:
        updates.append("total_amount = %s")
        values.append(payload.total_amount)
    if payload.currency is not None:
        updates.append("currency = %s")
        values.append(payload.currency)
    if payload.payment_method is not None:
        updates.append("payment_method = %s")
        values.append(payload.payment_method)
    if payload.payment_status is not None:
        updates.append("payment_status = %s")
        values.append(payload.payment_status)
    if payload.salesperson_id is not None:
        updates.append("salesperson_id = %s")
        values.append(payload.salesperson_id)
    if payload.channel is not None:
        updates.append("channel = %s")
        values.append(payload.channel)
    if payload.sale_date is not None:
        updates.append("sale_date = %s")
        values.append(payload.sale_date)
    if payload.due_date is not None:
        updates.append("due_date = %s")
        values.append(payload.due_date)
    if payload.sale_status is not None:
        updates.append("sale_status = %s")
        values.append(payload.sale_status)
    if payload.notes is not None:
        updates.append("notes = %s")
        values.append(payload.notes)
    if payload.reference_number is not None:
        updates.append("reference_number = %s")
        values.append(payload.reference_number)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    updates.append("updated_at = NOW()")
    values.extend([sale_id, current_user["tenant_id"]])

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    UPDATE sales s
                    SET {", ".join(updates)}
                    FROM branches b
                    JOIN users bu ON bu.id = b.user_id
                    WHERE s.id = %s
                      AND b.id = s.branch_id
                      AND bu.tenant_id = %s
                      AND b.status IN ('active', 'inactive')
                    RETURNING s.id
                    """,
                    tuple(values),
                )
                row = cur.fetchone()
            conn.commit()
            sale = _fetch_sale(conn, row["id"], current_user["tenant_id"]) if row else None
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invoice number already exists",
        ) from ex

    if not sale:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")

    return {"sale": sale}


@router.delete("/{sale_id}")
def delete_sale(
    sale_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM sales s
                                USING branches b, users bu
                WHERE s.id = %s
                  AND b.id = s.branch_id
                                    AND bu.id = b.user_id
                                    AND bu.tenant_id = %s
                  AND b.status IN ('active', 'inactive')
                RETURNING s.id
                """,
                                (sale_id, current_user["tenant_id"]),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")

    return {"message": "Sale deleted"}
