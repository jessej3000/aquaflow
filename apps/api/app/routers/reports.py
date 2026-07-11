from datetime import date, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query, status

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/reports", tags=["reports"])

PH_TZ = "Asia/Manila"


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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")
    try:
        claims = decode_token(token)
    except Exception as ex:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from ex
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, role, tenant_id, branch_id FROM users WHERE id = %s AND is_active = TRUE LIMIT 1",
                (user_id,),
            )
            user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return {
        "id": str(user["id"]),
        "role": user["role"],
        "tenant_id": str(user["tenant_id"]),
        "branch_id": user["branch_id"],
    }


@router.get("/daily-sales")
def daily_sales_summary(
    authorization: Optional[str] = Header(default=None),
    report_date: Optional[date] = Query(default=None, alias="date"),
    branch_id: Optional[int] = Query(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    is_admin = current_user["role"] == "admin"

    # Non-admins are locked to their own branch
    if not is_admin:
        if current_user["branch_id"] is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No branch assigned")
        branch_id = int(current_user["branch_id"])

    with get_connection() as conn:
        with conn.cursor() as cur:
            # Resolve "today" in Philippine time server-side so the client
            # doesn't need to worry about UTC offsets.
            if report_date is None:
                cur.execute("SELECT (NOW() AT TIME ZONE %s)::date AS d", (PH_TZ,))
                report_date = cur.fetchone()["d"]

            # Base WHERE clause — tenant isolation + date window in PH time
            base_where = """
                bu.tenant_id = %s
                AND b.status IN ('active', 'inactive')
                AND (s.sale_date AT TIME ZONE %s)::date = %s
            """
            base_params: list[Any] = [current_user["tenant_id"], PH_TZ, report_date]

            branch_filter = ""
            if branch_id is not None:
                branch_filter = " AND s.branch_id = %s"
                base_params.append(branch_id)

            # ── Summary totals ──────────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    COALESCE(SUM(s.total_amount), 0)                                    AS total_revenue,
                    COUNT(*)                                                             AS total_orders,
                    COALESCE(AVG(s.total_amount), 0)                                    AS avg_order_value,
                    COUNT(*) FILTER (WHERE s.sale_status = 'completed')                 AS completed_orders,
                    COUNT(*) FILTER (WHERE s.sale_status = 'pending')                   AS pending_orders,
                    COUNT(*) FILTER (WHERE s.sale_status = 'cancelled')                 AS cancelled_orders,
                    COUNT(*) FILTER (WHERE s.sale_status = 'refunded')                  AS refunded_orders,
                    COALESCE(SUM(s.total_amount) FILTER (WHERE s.payment_status = 'paid'), 0)    AS collected_revenue,
                    COALESCE(SUM(s.total_amount) FILTER (WHERE s.payment_status != 'paid'), 0)   AS uncollected_revenue
                FROM sales s
                JOIN branches b ON b.id = s.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE {base_where} {branch_filter}
                """,
                tuple(base_params),
            )
            summary_row = cur.fetchone()
            summary = {
                "total_revenue": float(summary_row["total_revenue"]),
                "total_orders": int(summary_row["total_orders"]),
                "avg_order_value": float(summary_row["avg_order_value"]),
                "completed_orders": int(summary_row["completed_orders"]),
                "pending_orders": int(summary_row["pending_orders"]),
                "cancelled_orders": int(summary_row["cancelled_orders"]),
                "refunded_orders": int(summary_row["refunded_orders"]),
                "collected_revenue": float(summary_row["collected_revenue"]),
                "uncollected_revenue": float(summary_row["uncollected_revenue"]),
            }

            # ── Per-branch breakdown ────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    b.id                            AS branch_id,
                    b.name                          AS branch_name,
                    COUNT(*)                        AS order_count,
                    COALESCE(SUM(s.total_amount), 0) AS total_revenue,
                    COALESCE(AVG(s.total_amount), 0) AS avg_order_value
                FROM sales s
                JOIN branches b ON b.id = s.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE {base_where} {branch_filter}
                GROUP BY b.id, b.name
                ORDER BY total_revenue DESC
                """,
                tuple(base_params),
            )
            by_branch = [
                {
                    "branch_id": r["branch_id"],
                    "branch_name": r["branch_name"],
                    "order_count": int(r["order_count"]),
                    "total_revenue": float(r["total_revenue"]),
                    "avg_order_value": float(r["avg_order_value"]),
                }
                for r in cur.fetchall()
            ]

            # ── By payment method ───────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    COALESCE(s.payment_method, 'unspecified') AS method,
                    COUNT(*)                                   AS order_count,
                    COALESCE(SUM(s.total_amount), 0)           AS total
                FROM sales s
                JOIN branches b ON b.id = s.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE {base_where} {branch_filter}
                GROUP BY s.payment_method
                ORDER BY total DESC
                """,
                tuple(base_params),
            )
            by_payment_method = [
                {
                    "method": r["method"],
                    "order_count": int(r["order_count"]),
                    "total": float(r["total"]),
                }
                for r in cur.fetchall()
            ]

            # ── By payment status ───────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    s.payment_status   AS payment_status,
                    COUNT(*)           AS order_count,
                    COALESCE(SUM(s.total_amount), 0) AS total
                FROM sales s
                JOIN branches b ON b.id = s.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE {base_where} {branch_filter}
                GROUP BY s.payment_status
                ORDER BY total DESC
                """,
                tuple(base_params),
            )
            by_payment_status = [
                {
                    "payment_status": r["payment_status"],
                    "order_count": int(r["order_count"]),
                    "total": float(r["total"]),
                }
                for r in cur.fetchall()
            ]

            # ── Recent sales (up to 50) ─────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    s.id, s.invoice_number,
                    s.customer_name,
                    b.name          AS branch_name,
                    s.total_amount,
                    s.payment_method,
                    s.payment_status,
                    s.sale_status,
                    s.sale_date,
                    s.channel
                FROM sales s
                JOIN branches b ON b.id = s.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE {base_where} {branch_filter}
                ORDER BY s.sale_date DESC
                LIMIT 50
                """,
                tuple(base_params),
            )
            recent_sales = [
                {
                    "id": r["id"],
                    "invoice_number": r["invoice_number"],
                    "customer_name": r["customer_name"],
                    "branch_name": r["branch_name"],
                    "total_amount": float(r["total_amount"]),
                    "payment_method": r["payment_method"],
                    "payment_status": r["payment_status"],
                    "sale_status": r["sale_status"],
                    "sale_date": r["sale_date"].isoformat() if r["sale_date"] else None,
                    "channel": r["channel"],
                }
                for r in cur.fetchall()
            ]

    return {
        "date": report_date.isoformat(),
        "summary": summary,
        "by_branch": by_branch,
        "by_payment_method": by_payment_method,
        "by_payment_status": by_payment_status,
        "recent_sales": recent_sales,
    }


@router.get("/delivery")
def delivery_report(
    authorization: Optional[str] = Header(default=None),
    report_date: Optional[date] = Query(default=None, alias="date"),
    branch_id: Optional[int] = Query(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    is_admin = current_user["role"] == "admin"

    if not is_admin:
        if current_user["branch_id"] is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No branch assigned")
        branch_id = int(current_user["branch_id"])

    with get_connection() as conn:
        with conn.cursor() as cur:
            if report_date is None:
                cur.execute("SELECT (NOW() AT TIME ZONE %s)::date AS d", (PH_TZ,))
                report_date = cur.fetchone()["d"]

            base_where = """
                bu.tenant_id = %s
                AND b.status IN ('active', 'inactive')
                AND o.order_type = 'delivery'
                AND o.delivery_date = %s
            """
            base_params: list[Any] = [current_user["tenant_id"], report_date]

            branch_filter = ""
            if branch_id is not None:
                branch_filter = " AND o.branch_id = %s"
                base_params.append(branch_id)

            # ── Summary ─────────────────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    COUNT(*)                                                              AS total,
                    COUNT(*) FILTER (WHERE o.order_status = 'delivered')                 AS delivered,
                    COUNT(*) FILTER (WHERE o.order_status = 'out-for-delivery')          AS out_for_delivery,
                    COUNT(*) FILTER (WHERE o.order_status = 'confirmed')                 AS confirmed,
                    COUNT(*) FILTER (WHERE o.order_status = 'pending')                   AS pending,
                    COUNT(*) FILTER (WHERE o.order_status = 'cancelled')                 AS cancelled,
                    COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_status = 'delivered'), 0) AS delivered_revenue,
                    COALESCE(SUM(o.total_amount), 0)                                     AS total_revenue
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE {base_where} {branch_filter}
                """,
                tuple(base_params),
            )
            row = cur.fetchone()
            summary = {
                "total": int(row["total"]),
                "delivered": int(row["delivered"]),
                "out_for_delivery": int(row["out_for_delivery"]),
                "confirmed": int(row["confirmed"]),
                "pending": int(row["pending"]),
                "cancelled": int(row["cancelled"]),
                "delivered_revenue": float(row["delivered_revenue"]),
                "total_revenue": float(row["total_revenue"]),
            }

            # ── By driver ────────────────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    o.delivery_id,
                    COALESCE(du.full_name, 'Unassigned')                                  AS driver_name,
                    COUNT(*)                                                               AS total,
                    COUNT(*) FILTER (WHERE o.order_status = 'delivered')                  AS delivered,
                    COUNT(*) FILTER (WHERE o.order_status = 'out-for-delivery')           AS out_for_delivery,
                    COUNT(*) FILTER (WHERE o.order_status = 'confirmed')                  AS confirmed,
                    COUNT(*) FILTER (WHERE o.order_status = 'pending')                    AS pending,
                    COUNT(*) FILTER (WHERE o.order_status = 'cancelled')                  AS cancelled,
                    COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_status = 'delivered'), 0) AS delivered_revenue
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                JOIN users bu ON bu.id = b.user_id
                LEFT JOIN users du ON du.id = o.delivery_id
                WHERE {base_where} {branch_filter}
                GROUP BY o.delivery_id, du.full_name
                ORDER BY delivered DESC, total DESC
                """,
                tuple(base_params),
            )
            by_driver = [
                {
                    "driver_id": str(r["delivery_id"]) if r["delivery_id"] else None,
                    "driver_name": r["driver_name"],
                    "total": int(r["total"]),
                    "delivered": int(r["delivered"]),
                    "out_for_delivery": int(r["out_for_delivery"]),
                    "confirmed": int(r["confirmed"]),
                    "pending": int(r["pending"]),
                    "cancelled": int(r["cancelled"]),
                    "delivered_revenue": float(r["delivered_revenue"]),
                }
                for r in cur.fetchall()
            ]

            # ── By branch ────────────────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    b.id                                                                   AS branch_id,
                    b.name                                                                 AS branch_name,
                    COUNT(*)                                                               AS total,
                    COUNT(*) FILTER (WHERE o.order_status = 'delivered')                  AS delivered,
                    COUNT(*) FILTER (WHERE o.order_status = 'cancelled')                  AS cancelled,
                    COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_status = 'delivered'), 0) AS delivered_revenue
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE {base_where} {branch_filter}
                GROUP BY b.id, b.name
                ORDER BY delivered DESC
                """,
                tuple(base_params),
            )
            by_branch = [
                {
                    "branch_id": r["branch_id"],
                    "branch_name": r["branch_name"],
                    "total": int(r["total"]),
                    "delivered": int(r["delivered"]),
                    "cancelled": int(r["cancelled"]),
                    "delivered_revenue": float(r["delivered_revenue"]),
                }
                for r in cur.fetchall()
            ]

            # ── Order list (up to 100) ───────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    o.id, o.order_number,
                    o.customer_name,
                    o.delivery_address,
                    b.name                                  AS branch_name,
                    COALESCE(du.full_name, 'Unassigned')    AS driver_name,
                    o.order_status,
                    o.delivery_date,
                    o.delivered_at,
                    o.delivery_time_slot,
                    o.container_type,
                    o.container_size,
                    o.quantity,
                    o.total_amount,
                    o.payment_method,
                    o.payment_status,
                    o.priority_flag
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                JOIN users bu ON bu.id = b.user_id
                LEFT JOIN users du ON du.id = o.delivery_id
                WHERE {base_where} {branch_filter}
                ORDER BY
                    CASE o.order_status
                        WHEN 'out-for-delivery' THEN 1
                        WHEN 'confirmed'        THEN 2
                        WHEN 'pending'          THEN 3
                        WHEN 'delivered'        THEN 4
                        WHEN 'cancelled'        THEN 5
                    END,
                    o.priority_flag DESC,
                    o.id ASC
                LIMIT 100
                """,
                tuple(base_params),
            )
            orders = [
                {
                    "id": r["id"],
                    "order_number": r["order_number"],
                    "customer_name": r["customer_name"],
                    "delivery_address": r["delivery_address"],
                    "branch_name": r["branch_name"],
                    "driver_name": r["driver_name"],
                    "order_status": r["order_status"],
                    "delivery_date": r["delivery_date"].isoformat() if r["delivery_date"] else None,
                    "delivered_at": r["delivered_at"].isoformat() if r["delivered_at"] else None,
                    "delivery_time_slot": r["delivery_time_slot"],
                    "container_type": r["container_type"],
                    "container_size": r["container_size"],
                    "quantity": r["quantity"],
                    "total_amount": float(r["total_amount"]),
                    "payment_method": r["payment_method"],
                    "payment_status": r["payment_status"],
                    "priority_flag": r["priority_flag"],
                }
                for r in cur.fetchall()
            ]

    return {
        "date": report_date.isoformat(),
        "summary": summary,
        "by_driver": by_driver,
        "by_branch": by_branch,
        "orders": orders,
    }


@router.get("/low-stock")
def low_stock_report(
    authorization: Optional[str] = Header(default=None),
    branch_id: Optional[int] = Query(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    is_admin = current_user["role"] == "admin"

    if not is_admin:
        if current_user["branch_id"] is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No branch assigned")
        branch_id = int(current_user["branch_id"])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT NOW() AT TIME ZONE %s AS ts", (PH_TZ,))
            generated_at = cur.fetchone()["ts"].isoformat()

            branch_filter = ""
            params: list[Any] = [current_user["tenant_id"]]
            if branch_id is not None:
                branch_filter = " AND i.branch_id = %s"
                params.append(branch_id)

            # Stock level is computed in SQL using CASE so the DB does the work
            cur.execute(
                f"""
                SELECT
                    i.id,
                    i.branch_id,
                    b.name          AS branch_name,
                    i.code,
                    i.name,
                    i.supplier,
                    i.quantity,
                    i.capacity,
                    i.unit_cost,
                    i.selling_price,
                    CASE
                        WHEN i.quantity = 0                                        THEN 'out_of_stock'
                        WHEN i.capacity > 0 AND i.quantity::float / i.capacity < 0.20 THEN 'critical'
                        WHEN i.capacity > 0 AND i.quantity::float / i.capacity < 0.40 THEN 'low'
                        ELSE 'ok'
                    END AS stock_level,
                    CASE
                        WHEN i.capacity > 0 THEN ROUND((i.quantity::float / i.capacity * 100)::numeric, 1)
                        ELSE NULL
                    END AS stock_pct
                FROM inventories i
                JOIN branches b ON b.id = i.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s
                  AND i.status = 'active'
                  AND i.deleted = FALSE
                  {branch_filter}
                ORDER BY
                    CASE
                        WHEN i.quantity = 0 THEN 1
                        WHEN i.capacity > 0 AND i.quantity::float / i.capacity < 0.20 THEN 2
                        WHEN i.capacity > 0 AND i.quantity::float / i.capacity < 0.40 THEN 3
                        ELSE 4
                    END,
                    i.quantity ASC,
                    b.name ASC,
                    i.name ASC
                """,
                tuple(params),
            )
            rows = cur.fetchall()

    items = [
        {
            "id": r["id"],
            "branch_id": r["branch_id"],
            "branch_name": r["branch_name"],
            "code": r["code"],
            "name": r["name"],
            "supplier": r["supplier"],
            "quantity": r["quantity"],
            "capacity": r["capacity"],
            "unit_cost": float(r["unit_cost"]),
            "selling_price": float(r["selling_price"]),
            "stock_level": r["stock_level"],
            "stock_pct": float(r["stock_pct"]) if r["stock_pct"] is not None else None,
        }
        for r in rows
    ]

    counts: dict[str, int] = {"out_of_stock": 0, "critical": 0, "low": 0, "ok": 0}
    for item in items:
        counts[item["stock_level"]] += 1

    # Per-branch summary
    branch_map: dict[int, dict[str, Any]] = {}
    for item in items:
        bid = item["branch_id"]
        if bid not in branch_map:
            branch_map[bid] = {
                "branch_id": bid,
                "branch_name": item["branch_name"],
                "total": 0, "out_of_stock": 0, "critical": 0, "low": 0, "ok": 0,
            }
        branch_map[bid]["total"] += 1
        branch_map[bid][item["stock_level"]] += 1

    by_branch = sorted(
        branch_map.values(),
        key=lambda b: (-(b["out_of_stock"] + b["critical"] + b["low"]), b["branch_name"]),
    )

    return {
        "generated_at": generated_at,
        "summary": {
            "total_items": len(items),
            "out_of_stock": counts["out_of_stock"],
            "critical": counts["critical"],
            "low": counts["low"],
            "ok": counts["ok"],
        },
        "items": items,
        "by_branch": by_branch,
    }


_PERIOD_DAYS: dict[str, Optional[int]] = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "all": None,
}


@router.get("/top-customers")
def top_customers_report(
    authorization: Optional[str] = Header(default=None),
    period: str = Query(default="30d", pattern=r"^(7d|30d|90d|all)$"),
    branch_id: Optional[int] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    is_admin = current_user["role"] == "admin"

    if not is_admin:
        if current_user["branch_id"] is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No branch assigned")
        branch_id = int(current_user["branch_id"])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT (NOW() AT TIME ZONE %s)::date AS today", (PH_TZ,))
            today: date = cur.fetchone()["today"]

        days = _PERIOD_DAYS[period]
        date_from: Optional[date] = (today - timedelta(days=days)) if days is not None else None
        date_to: date = today

        with conn.cursor() as cur:
            params: list[Any] = [current_user["tenant_id"]]
            date_filter = ""
            if date_from is not None:
                date_filter = " AND o.created_at::date >= %s AND o.created_at::date <= %s"
                params += [date_from, date_to]

            branch_filter = ""
            if branch_id is not None:
                branch_filter = " AND o.branch_id = %s"
                params.append(branch_id)

            params.append(limit)

            cur.execute(
                f"""
                SELECT
                    RANK() OVER (ORDER BY SUM(o.total_amount) DESC)  AS rank_by_spend,
                    RANK() OVER (ORDER BY COUNT(*) DESC)              AS rank_by_orders,
                    COALESCE(c.id::text, 'anon-' || MIN(o.customer_name)) AS customer_key,
                    c.id            AS customer_id,
                    c.code          AS customer_code,
                    COALESCE(c.name, o.customer_name, 'Unknown')     AS customer_name,
                    c.contact       AS customer_contact,
                    b2.name         AS branch_name,
                    COUNT(*)                                          AS total_orders,
                    COUNT(*) FILTER (WHERE o.order_status = 'delivered')    AS delivered_orders,
                    COUNT(*) FILTER (WHERE o.order_status = 'cancelled')    AS cancelled_orders,
                    COALESCE(SUM(o.total_amount), 0)                 AS total_spent,
                    COALESCE(AVG(o.total_amount), 0)                 AS avg_order_value,
                    COALESCE(SUM(o.quantity), 0)                     AS total_quantity,
                    MIN(o.created_at AT TIME ZONE %s)::date          AS first_order_date,
                    MAX(o.created_at AT TIME ZONE %s)::date          AS last_order_date
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                JOIN users bu ON bu.id = b.user_id
                LEFT JOIN customers c ON c.id = o.customer_id
                LEFT JOIN branches b2 ON b2.id = c.branch_id
                WHERE bu.tenant_id = %s
                  AND o.order_status <> 'cancelled'
                  {date_filter}
                  {branch_filter}
                GROUP BY c.id, c.code, c.name, c.contact, b2.name, o.customer_name
                ORDER BY total_spent DESC
                LIMIT %s
                """,
                (PH_TZ, PH_TZ, *params),
            )
            rows = cur.fetchall()

    customers = [
        {
            "rank": idx + 1,
            "customer_id": r["customer_id"],
            "customer_code": r["customer_code"],
            "customer_name": r["customer_name"],
            "customer_contact": r["customer_contact"],
            "branch_name": r["branch_name"],
            "total_orders": int(r["total_orders"]),
            "delivered_orders": int(r["delivered_orders"]),
            "cancelled_orders": int(r["cancelled_orders"]),
            "total_spent": float(r["total_spent"]),
            "avg_order_value": float(r["avg_order_value"]),
            "total_quantity": int(r["total_quantity"]),
            "first_order_date": r["first_order_date"].isoformat() if r["first_order_date"] else None,
            "last_order_date": r["last_order_date"].isoformat() if r["last_order_date"] else None,
        }
        for idx, r in enumerate(rows)
    ]

    return {
        "period": period,
        "date_from": date_from.isoformat() if date_from else None,
        "date_to": date_to.isoformat(),
        "customers": customers,
    }


@router.get("/branch-comparison")
def branch_comparison_report(
    authorization: Optional[str] = Header(default=None),
    period: str = Query(default="30d", pattern=r"^(7d|30d|90d|all)$"),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT (NOW() AT TIME ZONE %s)::date AS today", (PH_TZ,))
            today: date = cur.fetchone()["today"]

        days = _PERIOD_DAYS[period]
        date_from: Optional[date] = (today - timedelta(days=days)) if days is not None else None
        date_to: date = today

        date_params: list[Any] = []
        date_filter = ""
        if date_from is not None:
            date_filter = "AND o.created_at::date >= %s AND o.created_at::date <= %s"
            date_params = [date_from, date_to]

        sale_date_params: list[Any] = []
        sale_date_filter = ""
        if date_from is not None:
            sale_date_filter = "AND s.sale_date::date >= %s AND s.sale_date::date <= %s"
            sale_date_params = [date_from, date_to]

        tenant_id = current_user["tenant_id"]

        with conn.cursor() as cur:
            # ── Orders per branch ────────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    o.branch_id,
                    COUNT(*)                                                        AS total_orders,
                    COUNT(*) FILTER (WHERE o.order_status = 'delivered')            AS delivered_orders,
                    COUNT(*) FILTER (WHERE o.order_status = 'cancelled')            AS cancelled_orders,
                    COUNT(*) FILTER (WHERE o.order_status IN ('pending','confirmed','out-for-delivery')) AS active_orders,
                    COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_status <> 'cancelled'), 0) AS orders_revenue,
                    COALESCE(AVG(o.total_amount) FILTER (WHERE o.order_status <> 'cancelled'), 0) AS avg_order_value,
                    COALESCE(SUM(o.quantity)     FILTER (WHERE o.order_status = 'delivered'), 0)  AS total_containers
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s {date_filter}
                GROUP BY o.branch_id
                """,
                (tenant_id, *date_params),
            )
            orders_by_branch = {r["branch_id"]: r for r in cur.fetchall()}

            # ── Sales per branch ─────────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    s.branch_id,
                    COUNT(*)                        AS total_sales,
                    COALESCE(SUM(s.total_amount), 0) AS sales_revenue
                FROM sales s
                JOIN branches b ON b.id = s.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s
                  AND s.sale_status <> 'cancelled'
                  {sale_date_filter}
                GROUP BY s.branch_id
                """,
                (tenant_id, *sale_date_params),
            )
            sales_by_branch = {r["branch_id"]: r for r in cur.fetchall()}

            # ── Customers per branch ─────────────────────────────────────────
            cur.execute(
                """
                SELECT
                    c.branch_id,
                    COUNT(*)                                           AS total_customers,
                    COUNT(*) FILTER (WHERE c.status = 'active')       AS active_customers
                FROM customers c
                JOIN branches b ON b.id = c.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s
                GROUP BY c.branch_id
                """,
                (tenant_id,),
            )
            customers_by_branch = {r["branch_id"]: r for r in cur.fetchall()}

            # ── Inventory health per branch ──────────────────────────────────
            cur.execute(
                """
                SELECT
                    i.branch_id,
                    COUNT(*)                                                               AS total_items,
                    COUNT(*) FILTER (WHERE i.quantity = 0)                                AS out_of_stock,
                    COUNT(*) FILTER (WHERE i.quantity > 0 AND i.capacity > 0
                                     AND i.quantity::float / i.capacity < 0.20)           AS critical,
                    COUNT(*) FILTER (WHERE i.quantity > 0 AND i.capacity > 0
                                     AND i.quantity::float / i.capacity >= 0.20
                                     AND i.quantity::float / i.capacity < 0.40)           AS low
                FROM inventories i
                JOIN branches b ON b.id = i.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s
                  AND i.status = 'active'
                  AND i.deleted = FALSE
                GROUP BY i.branch_id
                """,
                (tenant_id,),
            )
            inventory_by_branch = {r["branch_id"]: r for r in cur.fetchall()}

            # ── Branch list ──────────────────────────────────────────────────
            cur.execute(
                """
                SELECT b.id, b.name, b.address, b.unit_id, b.status
                FROM branches b
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s
                  AND b.status IN ('active', 'inactive')
                ORDER BY b.name ASC
                """,
                (tenant_id,),
            )
            branch_rows = cur.fetchall()

    branches = []
    for b in branch_rows:
        bid = b["id"]
        o = orders_by_branch.get(bid)
        s = sales_by_branch.get(bid)
        c = customers_by_branch.get(bid)
        inv = inventory_by_branch.get(bid)

        total_orders = int(o["total_orders"]) if o else 0
        delivered_orders = int(o["delivered_orders"]) if o else 0
        delivery_rate = round(delivered_orders / total_orders * 100, 1) if total_orders > 0 else 0.0

        branches.append({
            "branch_id": bid,
            "branch_name": b["name"] or b["unit_id"],
            "branch_address": b["address"],
            "branch_status": b["status"],
            # Orders
            "total_orders": total_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": int(o["cancelled_orders"]) if o else 0,
            "active_orders": int(o["active_orders"]) if o else 0,
            "delivery_rate": delivery_rate,
            "total_containers": int(o["total_containers"]) if o else 0,
            "orders_revenue": float(o["orders_revenue"]) if o else 0.0,
            "avg_order_value": float(o["avg_order_value"]) if o else 0.0,
            # Sales
            "total_sales": int(s["total_sales"]) if s else 0,
            "sales_revenue": float(s["sales_revenue"]) if s else 0.0,
            # Customers
            "total_customers": int(c["total_customers"]) if c else 0,
            "active_customers": int(c["active_customers"]) if c else 0,
            # Inventory
            "inventory_items": int(inv["total_items"]) if inv else 0,
            "out_of_stock": int(inv["out_of_stock"]) if inv else 0,
            "inventory_critical": int(inv["critical"]) if inv else 0,
            "inventory_low": int(inv["low"]) if inv else 0,
        })

    # Sort by orders revenue descending
    branches.sort(key=lambda x: x["orders_revenue"], reverse=True)

    return {
        "period": period,
        "date_from": date_from.isoformat() if date_from else None,
        "date_to": date_to.isoformat(),
        "branches": branches,
    }


@router.get("/expense-vs-revenue")
def expense_vs_revenue_report(
    authorization: Optional[str] = Header(default=None),
    period: str = Query(default="6m", pattern=r"^(3m|6m|12m|all)$"),
    branch_id: Optional[int] = Query(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    tenant_id = current_user["tenant_id"]
    period_months = {"3m": 3, "6m": 6, "12m": 12, "all": None}
    months_back = period_months[period]

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT (NOW() AT TIME ZONE %s)::date AS today", (PH_TZ,))
            today: date = cur.fetchone()["today"]

        # Build branch filter
        branch_params: list[Any] = [tenant_id]
        branch_filter = ""
        if branch_id:
            branch_filter = "AND b.id = %s"
            branch_params.append(branch_id)

        # Build date filter for monthly data
        date_filter_order = ""
        date_filter_sale = ""
        date_filter_exp = ""
        date_params_order: list[Any] = []
        date_params_sale: list[Any] = []
        date_params_exp: list[Any] = []

        if months_back is not None:
            cutoff = date(today.year, today.month, 1)
            for _ in range(months_back - 1):
                if cutoff.month == 1:
                    cutoff = date(cutoff.year - 1, 12, 1)
                else:
                    cutoff = date(cutoff.year, cutoff.month - 1, 1)
            date_filter_order = "AND o.created_at::date >= %s"
            date_filter_sale  = "AND s.sale_date >= %s"
            date_filter_exp   = "AND e.expense_date >= %s"
            date_params_order = [cutoff]
            date_params_sale  = [cutoff]
            date_params_exp   = [cutoff]

        with conn.cursor() as cur:
            # ── Revenue from orders (delivered) ─────────────────────────────
            cur.execute(
                f"""
                SELECT
                    TO_CHAR(DATE_TRUNC('month', o.created_at AT TIME ZONE %s), 'YYYY-MM') AS month,
                    COALESCE(SUM(o.total_amount), 0)  AS orders_revenue,
                    COUNT(*)                          AS order_count
                FROM orders o
                JOIN branches b ON b.id = o.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s {branch_filter}
                  AND o.order_status = 'delivered'
                  {date_filter_order}
                GROUP BY 1
                """,
                (PH_TZ, *branch_params, *date_params_order),
            )
            orders_by_month = {r["month"]: r for r in cur.fetchall()}

            # ── Revenue from direct sales ────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    TO_CHAR(DATE_TRUNC('month', s.sale_date AT TIME ZONE %s), 'YYYY-MM') AS month,
                    COALESCE(SUM(s.total_amount), 0) AS sales_revenue,
                    COUNT(*)                         AS sale_count
                FROM sales s
                JOIN branches b ON b.id = s.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s {branch_filter}
                  AND s.sale_status <> 'cancelled'
                  {date_filter_sale}
                GROUP BY 1
                """,
                (PH_TZ, *branch_params, *date_params_sale),
            )
            sales_by_month = {r["month"]: r for r in cur.fetchall()}

            # ── Expenses ────────────────────────────────────────────────────
            cur.execute(
                f"""
                SELECT
                    TO_CHAR(DATE_TRUNC('month', e.expense_date), 'YYYY-MM') AS month,
                    e.category,
                    COALESCE(SUM(e.amount), 0) AS total
                FROM expenses e
                JOIN branches b ON b.id = e.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE bu.tenant_id = %s {branch_filter}
                  AND e.deleted = FALSE
                  {date_filter_exp}
                GROUP BY 1, 2
                """,
                (*branch_params, *date_params_exp),
            )
            expense_rows = cur.fetchall()

    # Collect all months that appear in any dataset
    all_months: set[str] = (
        set(orders_by_month.keys()) | set(sales_by_month.keys()) | {r["month"] for r in expense_rows}
    )

    # Aggregate expenses by month and category
    expenses_by_month: dict[str, dict[str, float]] = {}
    category_totals: dict[str, float] = {}
    for r in expense_rows:
        m = r["month"]
        cat = r["category"]
        amt = float(r["total"])
        if m not in expenses_by_month:
            expenses_by_month[m] = {}
        expenses_by_month[m][cat] = expenses_by_month[m].get(cat, 0.0) + amt
        category_totals[cat] = category_totals.get(cat, 0.0) + amt

    # Build monthly rows sorted ascending
    monthly = []
    for m in sorted(all_months):
        o = orders_by_month.get(m)
        s = sales_by_month.get(m)
        exp_cats = expenses_by_month.get(m, {})
        orders_rev = float(o["orders_revenue"]) if o else 0.0
        sales_rev  = float(s["sales_revenue"])  if s else 0.0
        total_rev  = orders_rev + sales_rev
        total_exp  = sum(exp_cats.values())
        net        = total_rev - total_exp
        margin     = round(net / total_rev * 100, 1) if total_rev > 0 else 0.0

        monthly.append({
            "month": m,
            "orders_revenue": orders_rev,
            "sales_revenue": sales_rev,
            "total_revenue": total_rev,
            "total_expenses": total_exp,
            "net_profit": net,
            "margin_pct": margin,
            "expense_breakdown": exp_cats,
            "order_count": int(o["order_count"]) if o else 0,
            "sale_count": int(s["sale_count"]) if s else 0,
        })

    grand_revenue  = sum(r["total_revenue"]  for r in monthly)
    grand_expenses = sum(r["total_expenses"] for r in monthly)
    grand_net      = grand_revenue - grand_expenses
    grand_margin   = round(grand_net / grand_revenue * 100, 1) if grand_revenue > 0 else 0.0

    return {
        "period": period,
        "monthly": monthly,
        "summary": {
            "total_revenue": grand_revenue,
            "total_expenses": grand_expenses,
            "net_profit": grand_net,
            "margin_pct": grand_margin,
        },
        "expense_by_category": category_totals,
    }
