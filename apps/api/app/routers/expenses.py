from datetime import date
from typing import Any, Optional

import asyncio

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked
from app.lib.feature_flags import is_flag_enabled


async def _require_expenses_enabled() -> None:
    enabled = await asyncio.to_thread(is_flag_enabled, "expenses_enabled")
    if not enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not available")


router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
    dependencies=[Depends(_require_expenses_enabled)],
)

CATEGORIES = ("utilities", "supplies", "salaries", "maintenance", "rent", "other")


def _get_current_user(authorization: Optional[str]) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ").strip()
    if is_token_revoked(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    try:
        claims = decode_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return claims


class ExpenseIn(BaseModel):
    branch_id: int
    category: str = Field(..., pattern=r"^(utilities|supplies|salaries|maintenance|rent|other)$")
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    expense_date: date


class ExpenseUpdate(BaseModel):
    category: Optional[str] = Field(default=None, pattern=r"^(utilities|supplies|salaries|maintenance|rent|other)$")
    description: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    expense_date: Optional[date] = None


@router.get("")
def list_expenses(
    authorization: Optional[str] = Header(default=None),
    branch_id: Optional[int] = Query(default=None),
    month: Optional[str] = Query(default=None, description="YYYY-MM"),
) -> list[dict[str, Any]]:
    current_user = _get_current_user(authorization)
    tenant_id = current_user["tenant_id"]

    filters = ["e.deleted = FALSE", "bu.tenant_id = %s"]
    params: list[Any] = [tenant_id]

    if current_user["role"] != "admin":
        filters.append("e.branch_id = %s")
        params.append(current_user["branch_id"])
    elif branch_id:
        filters.append("e.branch_id = %s")
        params.append(branch_id)

    if month:
        try:
            y, m = month.split("-")
            filters.append("DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', %s::date)")
            params.append(f"{y}-{m}-01")
        except ValueError:
            pass

    where = " AND ".join(filters)
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT e.id, e.branch_id, b.name AS branch_name,
                       e.category, e.description, e.amount,
                       e.expense_date, e.created_at
                FROM expenses e
                JOIN branches b ON b.id = e.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE {where}
                ORDER BY e.expense_date DESC, e.id DESC
                """,
                params,
            )
            rows = cur.fetchall()

    return [
        {
            "id": r["id"],
            "branch_id": r["branch_id"],
            "branch_name": r["branch_name"],
            "category": r["category"],
            "description": r["description"],
            "amount": float(r["amount"]),
            "expense_date": r["expense_date"].isoformat() if r["expense_date"] else None,
            "created_at": r["created_at"].isoformat() if r["created_at"] else None,
        }
        for r in rows
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_expense(
    body: ExpenseIn,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    if current_user["role"] not in ("admin", "staff"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    # Verify branch belongs to tenant
    tenant_id = current_user["tenant_id"]
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT b.id FROM branches b JOIN users bu ON bu.id = b.user_id WHERE b.id = %s AND bu.tenant_id = %s",
                (body.branch_id, tenant_id),
            )
            if not cur.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO expenses (branch_id, category, description, amount, expense_date, created_by)
                VALUES (%s, %s, %s, %s, %s, %s::uuid)
                RETURNING id, branch_id, category, description, amount, expense_date, created_at
                """,
                (body.branch_id, body.category, body.description, body.amount, body.expense_date, current_user["sub"]),
            )
            row = cur.fetchone()
        conn.commit()

    return {
        "id": row["id"],
        "branch_id": row["branch_id"],
        "category": row["category"],
        "description": row["description"],
        "amount": float(row["amount"]),
        "expense_date": row["expense_date"].isoformat(),
        "created_at": row["created_at"].isoformat(),
    }


@router.put("/{expense_id}")
def update_expense(
    expense_id: int,
    body: ExpenseUpdate,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    tenant_id = current_user["tenant_id"]

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT e.id FROM expenses e
                JOIN branches b ON b.id = e.branch_id
                JOIN users bu ON bu.id = b.user_id
                WHERE e.id = %s AND bu.tenant_id = %s AND e.deleted = FALSE
                """,
                (expense_id, tenant_id),
            )
            if not cur.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

        updates: list[str] = ["updated_at = NOW()"]
        params: list[Any] = []
        if body.category is not None:
            updates.append("category = %s"); params.append(body.category)
        if body.description is not None:
            updates.append("description = %s"); params.append(body.description)
        if body.amount is not None:
            updates.append("amount = %s"); params.append(body.amount)
        if body.expense_date is not None:
            updates.append("expense_date = %s"); params.append(body.expense_date)

        if not params:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nothing to update")

        params.append(expense_id)
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE expenses SET {', '.join(updates)} WHERE id = %s RETURNING id, category, description, amount, expense_date",
                params,
            )
            row = cur.fetchone()
        conn.commit()

    return {
        "id": row["id"],
        "category": row["category"],
        "description": row["description"],
        "amount": float(row["amount"]),
        "expense_date": row["expense_date"].isoformat(),
    }


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    authorization: Optional[str] = Header(default=None),
) -> None:
    current_user = _get_current_user(authorization)
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    tenant_id = current_user["tenant_id"]

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE expenses SET deleted = TRUE, updated_at = NOW()
                FROM branches b JOIN users bu ON bu.id = b.user_id
                WHERE expenses.branch_id = b.id AND bu.tenant_id = %s AND expenses.id = %s AND expenses.deleted = FALSE
                """,
                (tenant_id, expense_id),
            )
            if cur.rowcount == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        conn.commit()
