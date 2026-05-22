from typing import Any, List, Optional

import strawberry
from fastapi import HTTPException, Request
from strawberry.fastapi import BaseContext, GraphQLRouter
from strawberry.types import Info

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked
from app.gql.types import ActiveOrder, Branch, Customer, DailySales, Inventory, InventoryCapacity, Order


# ---------------------------------------------------------------------------
# Auth context
# ---------------------------------------------------------------------------

class GqlContext(BaseContext):
    def __init__(self, user: dict[str, Any]) -> None:
        self.user = user  # {"id": str, "role": str, "tenant_id": str}

    @property
    def is_admin(self) -> bool:
        return self.user.get("role") == "admin"

    @property
    def tenant_id(self) -> str:
        return self.user["tenant_id"]

    @property
    def user_id(self) -> str:
        return self.user["id"]


def _resolve_user(authorization: Optional[str]) -> dict[str, Any]:
    """Extract and validate Bearer token → return user dict."""
    if not authorization or not authorization.startswith("Bearer "):
        raise ValueError("Authorization Bearer token is required")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise ValueError("Authorization Bearer token is required")

    if is_token_revoked(token):
        raise PermissionError("Token has been revoked")

    try:
        claims = decode_token(token)
    except Exception as exc:
        raise PermissionError("Invalid token") from exc

    user_id = claims.get("sub")
    if not user_id:
        raise PermissionError("Invalid token claims")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, role, tenant_id FROM users WHERE id = %s AND is_active = TRUE LIMIT 1",
                (user_id,),
            )
            row = cur.fetchone()

    if not row:
        raise PermissionError("User not found or inactive")

    return {
        "id": str(row["id"]),
        "role": row["role"],
        "tenant_id": str(row["tenant_id"]),
    }


async def get_context(request: Request) -> GqlContext:
    authorization: Optional[str] = request.headers.get("Authorization")
    try:
        user = _resolve_user(authorization)
    except (ValueError, PermissionError) as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    return GqlContext(user=user)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _row_to_branch(row: dict[str, Any]) -> Branch:
    return Branch(
        id=row["id"],
        unit_id=row["unit_id"],
        name=row.get("name"),
        address=row.get("address"),
        contact=row.get("contact"),
        status=row["status"],
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


def _row_to_customer(row: dict[str, Any]) -> Customer:
    return Customer(
        id=row["id"],
        branch_id=row.get("branch_id"),
        branch_name=row.get("branch_name"),
        code=row["code"],
        name=row.get("name"),
        address=row.get("address"),
        contact=row.get("contact"),
        geolocation=row.get("geolocation"),
        status=row["status"],
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )



def _row_to_inventory(row: dict[str, Any]) -> Inventory:
    return Inventory(
        id=row["id"],
        branch_id=row.get("branch_id"),
        branch_name=row.get("branch_name"),
        code=row["code"],
        name=row["name"],
        description=row.get("description"),
        supplier=row.get("supplier"),
        quantity=row.get("quantity", 0),
        capacity=row.get("capacity", 0),
        unit_cost=float(row.get("unit_cost", 0)),
        selling_price=float(row.get("selling_price", 0)),
        status=row["status"],
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


def _row_to_order(row: dict[str, Any]) -> Order:
    return Order(
        id=row["id"],
        branch_id=row.get("branch_id"),
        branch_name=row.get("branch_name"),
        order_number=row["order_number"],
        customer_id=row.get("customer_id"),
        customer_name=row.get("customer_name"),
        delivery_address=row.get("delivery_address"),
        contact_number=row.get("contact_number"),
        order_type=row["order_type"],
        container_type=row.get("container_type"),
        container_size=int(row["container_size"]) if row.get("container_size") is not None else None,
        quantity=row.get("quantity", 0),
        borrowed_containers=row.get("borrowed_containers", 0),
        returned_containers=row.get("returned_containers", 0),
        unit_price=float(row.get("unit_price", 0)),
        subtotal=float(row.get("subtotal", 0)),
        discount=float(row.get("discount", 0)),
        delivery_fee=float(row.get("delivery_fee", 0)),
        total_amount=float(row.get("total_amount", 0)),
        amount_paid=float(row.get("amount_paid", 0)),
        change_amount=float(row.get("change_amount", 0)),
        payment_method=row.get("payment_method"),
        payment_status=row["payment_status"],
        delivery_date=row.get("delivery_date"),
        delivery_time_slot=row.get("delivery_time_slot"),
        delivery_notes=row.get("delivery_notes"),
        delivered_at=row.get("delivered_at"),
        order_status=row["order_status"],
        cancellation_reason=row.get("cancellation_reason"),
        priority_flag=bool(row.get("priority_flag", False)),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


# ---------------------------------------------------------------------------
# Query
# ---------------------------------------------------------------------------

@strawberry.type
class Query:

    @strawberry.field
    def branches(
        self,
        info: Info[GqlContext, None],
        status: Optional[str] = None,
    ) -> List[Branch]:
        ctx = info.context
        tenant_id = ctx.tenant_id
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT id, unit_id, name, address, contact, status, created_at, updated_at
                    FROM branches
                    WHERE tenant_id = %s AND status != 'deleted'
                """
                params: list[Any] = [tenant_id]
                if status:
                    query += " AND status = %s"
                    params.append(status)
                query += " ORDER BY name ASC NULLS LAST"
                cur.execute(query, params)
                rows = cur.fetchall()
        return [_row_to_branch(r) for r in rows]

    @strawberry.field
    def branch(self, info: Info[GqlContext, None], id: int) -> Optional[Branch]:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, unit_id, name, address, contact, status, created_at, updated_at
                    FROM branches
                    WHERE id = %s AND tenant_id = %s AND status != 'deleted'
                    """,
                    (id, ctx.tenant_id),
                )
                row = cur.fetchone()
        return _row_to_branch(row) if row else None

    @strawberry.field
    def customers(
        self,
        info: Info[GqlContext, None],
        branch_id: Optional[int] = None,
        status: Optional[str] = None,
    ) -> List[Customer]:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT c.id, c.branch_id, b.name AS branch_name, c.code,
                           c.name, c.address, c.contact, c.geolocation, c.status,
                           c.created_at, c.updated_at
                    FROM customers c
                    LEFT JOIN branches b ON b.id = c.branch_id
                    WHERE c.tenant_id = %s AND c.deleted = FALSE
                """
                params: list[Any] = [ctx.tenant_id]
                if not ctx.is_admin:
                    # non-admin: scope to their own branch
                    with get_connection() as conn2:
                        with conn2.cursor() as cur2:
                            cur2.execute(
                                "SELECT id FROM branches WHERE tenant_id = %s AND status != 'deleted' ORDER BY id LIMIT 1",
                                (ctx.tenant_id,),
                            )
                            b_row = cur2.fetchone()
                    if b_row:
                        query += " AND c.branch_id = %s"
                        params.append(b_row["id"])
                elif branch_id is not None:
                    query += " AND c.branch_id = %s"
                    params.append(branch_id)
                if status:
                    query += " AND c.status = %s"
                    params.append(status)
                query += " ORDER BY c.name ASC NULLS LAST"
                cur.execute(query, params)
                rows = cur.fetchall()
        return [_row_to_customer(r) for r in rows]

    @strawberry.field
    def customer(self, info: Info[GqlContext, None], id: int) -> Optional[Customer]:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT c.id, c.branch_id, b.name AS branch_name, c.code,
                           c.name, c.address, c.contact, c.geolocation, c.status,
                           c.created_at, c.updated_at
                    FROM customers c
                    LEFT JOIN branches b ON b.id = c.branch_id
                    WHERE c.id = %s AND c.tenant_id = %s AND c.deleted = FALSE
                    """,
                    (id, ctx.tenant_id),
                )
                row = cur.fetchone()
        return _row_to_customer(row) if row else None

    def inventories(
        self,
        info: Info[GqlContext, None],
        branch_id: Optional[int] = None,
        status: Optional[str] = None,
    ) -> List[Inventory]:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT i.id, i.branch_id, b.name AS branch_name, i.code,
                           i.name, i.description, i.supplier, i.quantity,
                           i.capacity, i.unit_cost, i.selling_price, i.status,
                           i.created_at, i.updated_at
                    FROM inventories i
                    LEFT JOIN branches b ON b.id = i.branch_id
                    JOIN users u ON u.id = b.user_id
                    WHERE u.tenant_id = %s AND i.deleted = FALSE
                """
                params: list[Any] = [ctx.tenant_id]
                if branch_id is not None:
                    query += " AND i.branch_id = %s"
                    params.append(branch_id)
                if status:
                    query += " AND i.status = %s"
                    params.append(status)
                query += " ORDER BY i.name ASC"
                cur.execute(query, params)
                rows = cur.fetchall()
        return [_row_to_inventory(r) for r in rows]

    @strawberry.field
    def inventory(self, info: Info[GqlContext, None], id: int) -> Optional[Inventory]:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT i.id, i.branch_id, b.name AS branch_name, i.code,
                           i.name, i.description, i.supplier, i.quantity,
                           i.capacity, i.unit_cost, i.selling_price, i.status,
                           i.created_at, i.updated_at
                    FROM inventories i
                    LEFT JOIN branches b ON b.id = i.branch_id
                    JOIN users u ON u.id = b.user_id
                    WHERE i.id = %s AND u.tenant_id = %s AND i.deleted = FALSE
                    """,
                    (id, ctx.tenant_id),
                )
                row = cur.fetchone()
        return _row_to_inventory(row) if row else None

    @strawberry.field
    def orders(
        self,
        info: Info[GqlContext, None],
        branch_id: Optional[int] = None,
        order_status: Optional[str] = None,
        payment_status: Optional[str] = None,
    ) -> List[Order]:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT o.id, o.branch_id, b.name AS branch_name,
                           o.order_number, o.customer_id, o.customer_name,
                           o.delivery_address, o.contact_number, o.order_type,
                           o.container_type, o.container_size, o.quantity,
                           o.borrowed_containers, o.returned_containers,
                           o.unit_price, o.subtotal, o.discount, o.delivery_fee,
                           o.total_amount, o.amount_paid, o.change_amount,
                           o.payment_method, o.payment_status, o.delivery_date,
                           o.delivery_time_slot, o.delivery_notes,
                           o.delivered_at, o.order_status, o.cancellation_reason,
                           o.priority_flag, o.created_at, o.updated_at
                    FROM orders o
                    LEFT JOIN branches b ON b.id = o.branch_id
                    WHERE o.tenant_id = %s AND o.deleted = FALSE
                """
                params: list[Any] = [ctx.tenant_id]
                if not ctx.is_admin:
                    with get_connection() as conn2:
                        with conn2.cursor() as cur2:
                            cur2.execute(
                                "SELECT id FROM branches WHERE tenant_id = %s AND status != 'deleted' ORDER BY id LIMIT 1",
                                (ctx.tenant_id,),
                            )
                            b_row = cur2.fetchone()
                    if b_row:
                        query += " AND o.branch_id = %s"
                        params.append(b_row["id"])
                elif branch_id is not None:
                    query += " AND o.branch_id = %s"
                    params.append(branch_id)
                if order_status:
                    query += " AND o.order_status = %s"
                    params.append(order_status)
                if payment_status:
                    query += " AND o.payment_status = %s"
                    params.append(payment_status)
                query += " ORDER BY o.created_at DESC"
                cur.execute(query, params)
                rows = cur.fetchall()
        return [_row_to_order(r) for r in rows]

    @strawberry.field
    def active_orders(
        self,
        info: Info[GqlContext, None],
        branch_id: Optional[int] = None,
    ) -> List[ActiveOrder]:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT o.order_number, o.customer_name, o.order_status,
                           o.order_type, o.total_amount
                    FROM orders o
                    WHERE o.tenant_id = %s
                      AND o.deleted = FALSE
                      AND o.order_status NOT IN ('delivered', 'cancelled')
                """
                params: list[Any] = [ctx.tenant_id]
                if not ctx.is_admin:
                    with get_connection() as conn2:
                        with conn2.cursor() as cur2:
                            cur2.execute(
                                "SELECT id FROM branches WHERE tenant_id = %s AND status != 'deleted' ORDER BY id LIMIT 1",
                                (ctx.tenant_id,),
                            )
                            b_row = cur2.fetchone()
                    if b_row:
                        query += " AND o.branch_id = %s"
                        params.append(b_row["id"])
                elif branch_id is not None:
                    query += " AND o.branch_id = %s"
                    params.append(branch_id)
                query += " ORDER BY o.created_at DESC"
                cur.execute(query, params)
                rows = cur.fetchall()
        return [
            ActiveOrder(
                order_number=r["order_number"],
                customer_name=r.get("customer_name"),
                order_status=r["order_status"],
                order_type=r["order_type"],
                total_amount=float(r.get("total_amount", 0)),
            )
            for r in rows
        ]

    @strawberry.field
    def order(self, info: Info[GqlContext, None], id: int) -> Optional[Order]:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT o.id, o.branch_id, b.name AS branch_name,
                           o.order_number, o.customer_id, o.customer_name,
                           o.delivery_address, o.contact_number, o.order_type,
                           o.container_type, o.container_size, o.quantity,
                           o.borrowed_containers, o.returned_containers,
                           o.unit_price, o.subtotal, o.discount, o.delivery_fee,
                           o.total_amount, o.amount_paid, o.change_amount,
                           o.payment_method, o.payment_status, o.delivery_date,
                           o.delivery_time_slot, o.delivery_notes,
                           o.delivered_at, o.order_status, o.cancellation_reason,
                           o.priority_flag, o.created_at, o.updated_at
                    FROM orders o
                    LEFT JOIN branches b ON b.id = o.branch_id
                    WHERE o.id = %s AND o.tenant_id = %s AND o.deleted = FALSE
                    """,
                    (id, ctx.tenant_id),
                )
                row = cur.fetchone()
        return _row_to_order(row) if row else None


# ---------------------------------------------------------------------------
# Schema + router
# ---------------------------------------------------------------------------
    @strawberry.field
    def daily_sales(
        self,
        info: Info[GqlContext, None],
        branch_id: Optional[int] = None,
    ) -> DailySales:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT
                        COALESCE(SUM(CASE WHEN o.created_at::date = CURRENT_DATE THEN o.amount_paid ELSE 0 END), 0) AS day1,
                        COALESCE(SUM(CASE WHEN o.created_at::date = CURRENT_DATE - INTERVAL '1 day' THEN o.amount_paid ELSE 0 END), 0) AS day2,
                        COALESCE(SUM(CASE WHEN o.created_at::date = CURRENT_DATE - INTERVAL '2 day' THEN o.amount_paid ELSE 0 END), 0) AS day3,
                        COALESCE(SUM(CASE WHEN o.created_at::date = CURRENT_DATE - INTERVAL '3 day' THEN o.amount_paid ELSE 0 END), 0) AS day4,
                        COALESCE(SUM(CASE WHEN o.created_at::date = CURRENT_DATE - INTERVAL '4 day' THEN o.amount_paid ELSE 0 END), 0) AS day5,
                        COALESCE(SUM(CASE WHEN o.created_at::date = CURRENT_DATE - INTERVAL '5 day' THEN o.amount_paid ELSE 0 END), 0) AS day6,
                        COALESCE(SUM(CASE WHEN o.created_at::date = CURRENT_DATE - INTERVAL '6 day' THEN o.amount_paid ELSE 0 END), 0) AS day7
                    FROM orders o
                    WHERE o.tenant_id = %s
                      AND o.payment_status = 'paid'
                      AND o.deleted = FALSE
                """
                params: list[Any] = [ctx.tenant_id]
                if branch_id is not None:
                    query += " AND o.branch_id = %s"
                    params.append(branch_id)
                cur.execute(query, params)
                row = cur.fetchone() or {}

        return DailySales(
            day1=float(row.get("day1", 0) or 0),
            day2=float(row.get("day2", 0) or 0),
            day3=float(row.get("day3", 0) or 0),
            day4=float(row.get("day4", 0) or 0),
            day5=float(row.get("day5", 0) or 0),
            day6=float(row.get("day6", 0) or 0),
            day7=float(row.get("day7", 0) or 0),
        )

    @strawberry.field
    def inventory_capacity(
        self,
        info: Info[GqlContext, None],
        branch_id: Optional[int] = None,
    ) -> InventoryCapacity:
        ctx = info.context
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Total capacity = SUM(quantity * capacity) across active inventories
                inv_query = """
                    SELECT COALESCE(SUM(i.quantity * i.capacity), 0) AS total_capacity
                    FROM inventories i
                    JOIN branches b ON b.id = i.branch_id
                                        JOIN users u ON u.id = b.user_id
                                        WHERE u.tenant_id = %s
                      AND i.deleted = FALSE
                      AND i.status = 'active'
                """
                inv_params: list[Any] = [ctx.tenant_id]
                if branch_id is not None:
                    inv_query += " AND i.branch_id = %s"
                    inv_params.append(branch_id)
                cur.execute(inv_query, inv_params)
                cap_row = cur.fetchone()

                # Demand = SUM(quantity * container_size) for tenant orders.
                ord_query = """
                    SELECT COALESCE(SUM(
                        o.quantity * COALESCE(o.container_size, 0)
                    ), 0) AS total_demand
                    FROM orders o
                    JOIN branches b ON b.id = o.branch_id
                    JOIN users u ON u.id = b.user_id
                    WHERE u.tenant_id = %s
                      AND o.deleted = FALSE
                """
                ord_params: list[Any] = [ctx.tenant_id]
                if branch_id is not None:
                    ord_query += " AND o.branch_id = %s"
                    ord_params.append(branch_id)
                cur.execute(ord_query, ord_params)
                dem_row = cur.fetchone()

        return InventoryCapacity(
            capacity=float(cap_row["total_capacity"]) if cap_row else 0.0,
            demand=float(dem_row["total_demand"]) if dem_row else 0.0,
        )


schema = strawberry.Schema(query=Query)

graphql_router = GraphQLRouter(schema, context_getter=get_context)
