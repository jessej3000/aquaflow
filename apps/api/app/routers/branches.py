from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field
from psycopg.errors import UniqueViolation

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/branches", tags=["branches"])

BRANCH_STATUS_PATTERN = r"^(active|inactive|deleted)$"
VISIBLE_BRANCH_STATUS = ("active", "inactive")


class CreateBranchRequest(BaseModel):
    unit_id: str = Field(min_length=5, max_length=5, pattern=r"^[0-9]{5}$")
    name: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None
    status: str = Field(default="active", pattern=BRANCH_STATUS_PATTERN)


class UpdateBranchRequest(BaseModel):
    unit_id: Optional[str] = Field(default=None, min_length=5, max_length=5, pattern=r"^[0-9]{5}$")
    name: Optional[str] = None
    address: Optional[str] = None
    contact: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern=BRANCH_STATUS_PATTERN)


def _get_current_user_id(authorization: Optional[str]) -> str:
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

    return str(user_id)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_branch(
    payload: CreateBranchRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    user_id = _get_current_user_id(authorization)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO branches (user_id, unit_id, name, address, contact, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, user_id, unit_id, name, address, contact, status, created_at, updated_at
                    """,
                    (
                        user_id,
                        payload.unit_id,
                        payload.name,
                        payload.address,
                        payload.contact,
                        payload.status,
                    ),
                )
                branch = cur.fetchone()
            conn.commit()
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unit ID already exists",
        ) from ex

    return {"branch": branch}


@router.get("")
def list_branches(authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    user_id = _get_current_user_id(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, unit_id, name, address, contact, status, created_at, updated_at
                FROM branches
                WHERE user_id = %s AND status = ANY(%s)
                ORDER BY id ASC
                """,
                (user_id, list(VISIBLE_BRANCH_STATUS)),
            )
            branches = cur.fetchall()

    return {"branches": branches}


@router.get("/{branch_id}")
def get_branch(
    branch_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    user_id = _get_current_user_id(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, unit_id, name, address, contact, status, created_at, updated_at
                FROM branches
                WHERE id = %s AND user_id = %s AND status = ANY(%s)
                LIMIT 1
                """,
                (branch_id, user_id, list(VISIBLE_BRANCH_STATUS)),
            )
            branch = cur.fetchone()

    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    return {"branch": branch}


@router.put("/{branch_id}")
def update_branch(
    branch_id: int,
    payload: UpdateBranchRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    user_id = _get_current_user_id(authorization)

    updates: list[str] = []
    values: list[Any] = []

    if payload.unit_id is not None:
        updates.append("unit_id = %s")
        values.append(payload.unit_id)
    if payload.name is not None:
        updates.append("name = %s")
        values.append(payload.name)
    if payload.address is not None:
        updates.append("address = %s")
        values.append(payload.address)
    if payload.contact is not None:
        updates.append("contact = %s")
        values.append(payload.contact)
    if payload.status is not None:
        updates.append("status = %s")
        values.append(payload.status)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    values.extend([branch_id, user_id])

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    UPDATE branches
                    SET {", ".join(updates)}, updated_at = NOW()
                    WHERE id = %s AND user_id = %s AND status = ANY(%s)
                    RETURNING id, user_id, unit_id, name, address, contact, status, created_at, updated_at
                    """,
                    tuple(values + [list(VISIBLE_BRANCH_STATUS)]),
                )
                branch = cur.fetchone()
            conn.commit()
    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unit ID already exists",
        ) from ex

    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    return {"branch": branch}


@router.delete("/{branch_id}")
def delete_branch(
    branch_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    user_id = _get_current_user_id(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE branches
                SET status = 'deleted', updated_at = NOW()
                WHERE id = %s AND user_id = %s AND status <> 'deleted'
                RETURNING id
                """,
                (branch_id, user_id),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    return {"message": "Branch deleted"}
