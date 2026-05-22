from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/feedback", tags=["feedback"])


class CreateFeedbackRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    branch_id: Optional[int] = None
    type: str = Field(default="suggestion", pattern=r"^(bug|suggestion)$")
    status: str = Field(default="new", pattern=r"^(new|processed|implemented|ignored)$")


class UpdateFeedbackRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    branch_id: Optional[int] = None
    type: Optional[str] = Field(default=None, pattern=r"^(bug|suggestion)$")
    status: Optional[str] = Field(default=None, pattern=r"^(new|processed|implemented|ignored)$")


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
                SELECT id, full_name, role, tenant_id, branch_id
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
        "full_name": user["full_name"],
        "role": user["role"],
        "tenant_id": str(user["tenant_id"]),
        "branch_id": user["branch_id"],
    }


def _fetch_feedback(conn: Any, feedback_id: int, tenant_id: str) -> Optional[Any]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT f.id, f.title, f.description,
                   f.user_id, f.username,
                   f.branch_id, f.branchname,
                   f.type, f.status,
                   f.created_at, f.updated_at,
                   f.tenant_id
            FROM feedback f
            WHERE f.id = %s
              AND f.tenant_id = %s
            LIMIT 1
            """,
            (feedback_id, tenant_id),
        )
        return cur.fetchone()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_feedback(
    payload: CreateFeedbackRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    branch_id = payload.branch_id or current_user["branch_id"]
    branchname: Optional[str] = None

    if branch_id is not None:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT b.id, b.name
                    FROM branches b
                    JOIN users u ON u.id = b.user_id
                    WHERE b.id = %s AND u.tenant_id = %s
                    LIMIT 1
                    """,
                    (branch_id, current_user["tenant_id"]),
                )
                branch = cur.fetchone()
        if not branch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
        branch_id = int(branch["id"])
        branchname = branch["name"]

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO feedback (
                    title, description,
                    user_id, username,
                    branch_id, branchname,
                    type, status,
                    tenant_id
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    payload.title,
                    payload.description,
                    current_user["id"],
                    current_user["full_name"],
                    branch_id,
                    branchname,
                    payload.type,
                    payload.status,
                    current_user["tenant_id"],
                ),
            )
            row = cur.fetchone()
        conn.commit()
        feedback = _fetch_feedback(conn, row["id"], current_user["tenant_id"])

    return {"feedback": feedback}


@router.get("")
def list_feedback(
    authorization: Optional[str] = Header(default=None),
    branch_id: Optional[int] = Query(default=None),
    type: Optional[str] = Query(default=None, pattern=r"^(bug|suggestion)$"),
    feedback_status: Optional[str] = Query(default=None, alias="status", pattern=r"^(new|processed|implemented|ignored)$"),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    if current_user["role"] != "admin":
        if current_user["branch_id"] is not None:
            if branch_id is not None and int(branch_id) != int(current_user["branch_id"]):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Non-admin users can only access their assigned branch",
                )
            branch_id = int(current_user["branch_id"])

    with get_connection() as conn:
        with conn.cursor() as cur:
            sql = """
                SELECT f.id, f.title, f.description,
                       f.user_id, f.username,
                       f.branch_id, f.branchname,
                       f.type, f.status,
                       f.created_at, f.updated_at,
                       f.tenant_id
                FROM feedback f
                WHERE f.tenant_id = %s
            """
            params: list[Any] = [current_user["tenant_id"]]

            if branch_id is not None:
                sql += " AND f.branch_id = %s"
                params.append(branch_id)

            if type is not None:
                sql += " AND f.type = %s"
                params.append(type)

            if feedback_status is not None:
                sql += " AND f.status = %s"
                params.append(feedback_status)

            sql += " ORDER BY f.id DESC"

            cur.execute(sql, tuple(params))
            items = cur.fetchall()

    return {"feedback": items}


@router.get("/{feedback_id}")
def get_feedback(
    feedback_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current_user = _get_current_user(authorization)

    with get_connection() as conn:
        item = _fetch_feedback(conn, feedback_id, current_user["tenant_id"])

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")

    return {"feedback": item}


@router.put("/{feedback_id}")
def update_feedback(
    feedback_id: int,
    payload: UpdateFeedbackRequest,
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
                    SELECT b.id, b.name
                    FROM branches b
                    JOIN users u ON u.id = b.user_id
                    WHERE b.id = %s AND u.tenant_id = %s
                    LIMIT 1
                    """,
                    (payload.branch_id, current_user["tenant_id"]),
                )
                branch = cur.fetchone()
        if not branch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
        updates.append("branch_id = %s")
        values.append(int(branch["id"]))
        updates.append("branchname = %s")
        values.append(branch["name"])

    if payload.title is not None:
        updates.append("title = %s")
        values.append(payload.title)

    if payload.description is not None:
        updates.append("description = %s")
        values.append(payload.description)

    if payload.type is not None:
        updates.append("type = %s")
        values.append(payload.type)

    if payload.status is not None:
        updates.append("status = %s")
        values.append(payload.status)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    updates.append("updated_at = NOW()")
    values.extend([feedback_id, current_user["tenant_id"]])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                UPDATE feedback
                SET {", ".join(updates)}
                WHERE id = %s AND tenant_id = %s
                RETURNING id
                """,
                tuple(values),
            )
            row = cur.fetchone()
        conn.commit()
        item = _fetch_feedback(conn, row["id"], current_user["tenant_id"]) if row else None

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")

    return {"feedback": item}


@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    current_user = _get_current_user(authorization)

    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete feedback",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM feedback
                WHERE id = %s AND tenant_id = %s
                RETURNING id
                """,
                (feedback_id, current_user["tenant_id"]),
            )
            deleted = cur.fetchone()
        conn.commit()

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")

    return {"message": "Feedback deleted"}
