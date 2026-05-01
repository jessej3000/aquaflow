from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field
from datetime import date

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/riders", tags=["riders"])


class CreateRiderRequest(BaseModel):
    branch_id: Optional[int] = None
    name: Optional[str] = None
    contact: Optional[str] = None
    vehicle: Optional[str] = None
    ranking: int = Field(default=0, ge=0)
    joined: Optional[date] = None
    status: str = Field(default="active", pattern=r"^(active|inactive)$")
    geolocation: Optional[str] = None


class UpdateRiderRequest(BaseModel):
    branch_id: Optional[int] = None
    name: Optional[str] = None
    contact: Optional[str] = None
    vehicle: Optional[str] = None
    ranking: Optional[int] = Field(default=None, ge=0)
    joined: Optional[date] = None
    status: Optional[str] = Field(default=None, pattern=r"^(active|inactive)$")
    geolocation: Optional[str] = None


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
                "SELECT id FROM users WHERE id = %s AND is_active = TRUE LIMIT 1",
                (user_id,),
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return str(user["id"])


def _fetch_rider(conn: Any, rider_id: int) -> Optional[Any]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT r.id, r.branch_id, b.name AS branch_name,
                   r.name, r.contact, r.vehicle, r.ranking,
                   r.joined, r.status, r.geolocation, r.created_at, r.updated_at
            FROM riders r
            LEFT JOIN branches b ON b.id = r.branch_id
            WHERE r.id = %s AND r.deleted = FALSE
            LIMIT 1
            """,
            (rider_id,),
        )
        return cur.fetchone()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_rider(
    payload: CreateRiderRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    _get_current_user_id(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO riders (branch_id, name, contact, vehicle, ranking, joined, status, geolocation)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    payload.branch_id,
                    payload.name,
                    payload.contact,
                    payload.vehicle,
                    payload.ranking,
                    payload.joined,
                    payload.status,
                    payload.geolocation,
                ),
            )
            row = cur.fetchone()
        conn.commit()
        rider = _fetch_rider(conn, row["id"])

    return {"rider": rider}


@router.get("")
def list_riders(
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    _get_current_user_id(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.id, r.branch_id, b.name AS branch_name,
                       r.name, r.contact, r.vehicle, r.ranking,
                       r.joined, r.status, r.geolocation, r.created_at, r.updated_at
                FROM riders r
                LEFT JOIN branches b ON b.id = r.branch_id
                WHERE r.deleted = FALSE
                ORDER BY r.id ASC
                """
            )
            riders = cur.fetchall()

    return {"riders": riders}


@router.get("/{rider_id}")
def get_rider(
    rider_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    _get_current_user_id(authorization)

    with get_connection() as conn:
        rider = _fetch_rider(conn, rider_id)

    if not rider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rider not found")

    return {"rider": rider}


@router.put("/{rider_id}")
def update_rider(
    rider_id: int,
    payload: UpdateRiderRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    _get_current_user_id(authorization)

    updates: list[str] = []
    values: list[Any] = []

    if payload.branch_id is not None:
        updates.append("branch_id = %s")
        values.append(payload.branch_id)
    if payload.name is not None:
        updates.append("name = %s")
        values.append(payload.name)
    if payload.contact is not None:
        updates.append("contact = %s")
        values.append(payload.contact)
    if payload.vehicle is not None:
        updates.append("vehicle = %s")
        values.append(payload.vehicle)
    if payload.ranking is not None:
        updates.append("ranking = %s")
        values.append(payload.ranking)
    if payload.joined is not None:
        updates.append("joined = %s")
        values.append(payload.joined)
    if payload.status is not None:
        updates.append("status = %s")
        values.append(payload.status)
    if payload.geolocation is not None:
        updates.append("geolocation = %s")
        values.append(payload.geolocation)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    updates.append("updated_at = NOW()")
    values.append(rider_id)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                UPDATE riders
                SET {", ".join(updates)}
                WHERE id = %s AND deleted = FALSE
                RETURNING id
                """,
                tuple(values),
            )
            row = cur.fetchone()
        conn.commit()
        rider = _fetch_rider(conn, row["id"]) if row else None

    if not rider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rider not found")

    return {"rider": rider}


@router.delete("/{rider_id}")
def delete_rider(
    rider_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    _get_current_user_id(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE riders
                SET deleted = TRUE, updated_at = NOW()
                WHERE id = %s AND deleted = FALSE
                RETURNING id
                """,
                (rider_id,),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rider not found")

    return {"message": "Rider deleted"}
