import json
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/products", tags=["products"])


class CreateProductRequest(BaseModel):
    branch_id: Optional[int] = None
    code: Optional[str] = None
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    unit_price: float = Field(default=0.0, ge=0)
    components: Any = Field(default_factory=list)


class UpdateProductRequest(BaseModel):
    branch_id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    unit_price: Optional[float] = Field(default=None, ge=0)
    components: Optional[Any] = None


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
                SELECT id, role, branch_id
                FROM users
                WHERE id = %s AND is_active = TRUE
                LIMIT 1
                """,
                (user_id,),
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return {"id": str(user["id"]), "role": user["role"], "branch_id": user.get("branch_id")}


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
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
                return int(branch["id"]) 

            if role != "admin":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="branch_id is required for non-admin users")

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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active branch found for this user")

    return int(branch["id"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_product(payload: CreateProductRequest, authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    current_user = _get_current_user(authorization)
    branch_id = _resolve_branch_id_for_create(current_user["id"], current_user["role"], payload.branch_id)

    components_value = json.dumps(payload.components) if isinstance(payload.components, (dict, list)) else payload.components

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO products (branch_id, code, name, description, unit_price, components)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, branch_id, code, name, description, unit_price, components
                """,
                (branch_id, payload.code, payload.name, payload.description, payload.unit_price, components_value),
            )
            product = cur.fetchone()
        conn.commit()

    return {"product": product}


@router.get("")
def list_products(authorization: Optional[str] = Header(default=None), branch_id: Optional[int] = Query(default=None)) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    # Non-admin users must have a branch_id (assigned branch) and can only query their own branch
    if current_user["role"] != "admin":
        if not current_user.get("branch_id"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not assigned to a branch")
        # Override branch_id to the user's assigned branch for non-admins
        branch_id = current_user["branch_id"]
    elif branch_id is None:
        # Admin without branch_id query: show products from all their owned branches
        pass

    with get_connection() as conn:
        with conn.cursor() as cur:
            if current_user["role"] == "admin":
                # Admins see products from branches they own
                sql = """
                    SELECT p.id, p.branch_id, b.name AS branch_name, p.code, p.name, p.description, p.unit_price, p.components
                    FROM products p
                    JOIN branches b ON b.id = p.branch_id
                    WHERE b.user_id = %s
                      AND b.status IN ('active', 'inactive')
                """
                params: list[Any] = [current_user["id"]]

                if branch_id is not None:
                    sql += " AND p.branch_id = %s"
                    params.append(branch_id)
            else:
                # Non-admins see products from their assigned branch
                sql = """
                    SELECT p.id, p.branch_id, b.name AS branch_name, p.code, p.name, p.description, p.unit_price, p.components
                    FROM products p
                    JOIN branches b ON b.id = p.branch_id
                    WHERE b.id = %s
                      AND b.status IN ('active', 'inactive')
                """
                params = [branch_id]

            sql += " ORDER BY p.id ASC"
            cur.execute(sql, tuple(params))
            products = cur.fetchall()

    return {"products": products}


@router.get("/{product_id}")
def get_product(product_id: int, authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            if current_user["role"] == "admin":
                # Admins see products from branches they own
                cur.execute(
                    """
                    SELECT p.id, p.branch_id, b.name AS branch_name, p.code, p.name, p.description, p.unit_price, p.components
                    FROM products p
                    JOIN branches b ON b.id = p.branch_id
                    WHERE p.id = %s
                      AND b.user_id = %s
                      AND b.status IN ('active', 'inactive')
                    LIMIT 1
                    """,
                    (product_id, current_user["id"]),
                )
            else:
                # Non-admins see products from their assigned branch
                if not current_user.get("branch_id"):
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not assigned to a branch")
                cur.execute(
                    """
                    SELECT p.id, p.branch_id, b.name AS branch_name, p.code, p.name, p.description, p.unit_price, p.components
                    FROM products p
                    JOIN branches b ON b.id = p.branch_id
                    WHERE p.id = %s
                      AND p.branch_id = %s
                      AND b.status IN ('active', 'inactive')
                    LIMIT 1
                    """,
                    (product_id, current_user["branch_id"]),
                )
            product = cur.fetchone()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return {"product": product}


@router.put("/{product_id}")
def update_product(product_id: int, payload: UpdateProductRequest, authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
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
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
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
    if payload.unit_price is not None:
        updates.append("unit_price = %s")
        values.append(payload.unit_price)
    if payload.components is not None:
        updates.append("components = %s")
        components_value = json.dumps(payload.components) if isinstance(payload.components, (dict, list)) else payload.components
        values.append(components_value)

    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")

    values.extend([product_id, current_user["id"]])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                UPDATE products p
                SET {', '.join(updates)}
                FROM branches b
                WHERE p.id = %s
                  AND b.id = p.branch_id
                  AND b.user_id = %s
                  AND b.status IN ('active', 'inactive')
                RETURNING p.id, p.branch_id, b.name AS branch_name, p.code, p.name, p.description, p.unit_price, p.components
                """,
                tuple(values),
            )
            product = cur.fetchone()
        conn.commit()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return {"product": product}


@router.delete("/{product_id}")
def delete_product(product_id: int, authorization: Optional[str] = Header(default=None)) -> dict[str, str]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM products p
                USING branches b
                WHERE p.id = %s
                  AND b.id = p.branch_id
                  AND b.user_id = %s
                RETURNING p.id
                """,
                (product_id, current_user["id"]),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return {"message": "Product deleted"}
