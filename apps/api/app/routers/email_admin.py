from typing import Any, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.db import get_connection
from app.services.email_service import get_provider_status, send_email

router = APIRouter(prefix="/api/email", tags=["email"])


class SendEmailRequest(BaseModel):
    to: EmailStr
    subject: str
    body: str
    from_name: Optional[str] = None


@router.post("/send", status_code=status.HTTP_200_OK)
def api_send_email(payload: SendEmailRequest) -> dict[str, Any]:
    """
    Send a transactional email through the fallback chain.
    Returns which provider was used.
    """
    try:
        provider = send_email(
            to=payload.to,
            subject=payload.subject,
            body=payload.body,
            from_name=payload.from_name,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return {"success": True, "provider": provider}


@router.get("/status", status_code=status.HTTP_200_OK)
def api_email_status() -> dict[str, Any]:
    """
    Return current send-count vs limit for every provider.
    Also surfaces which provider would be used next.
    """
    providers = get_provider_status()
    active = next((p["name"] for p in providers if p["available"]), None)
    return {"providers": providers, "active_provider": active}


@router.get("/logs", status_code=status.HTTP_200_OK)
def api_email_logs(limit: int = 20) -> dict[str, Any]:
    """Return the most recent email send attempts (default last 20)."""
    limit = min(max(limit, 1), 100)  # clamp to 1–100

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, created_at, recipient, subject, provider, success, error_message
                FROM email_logs
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (limit,),
            )
            rows = cur.fetchall()

    return {
        "logs": [
            {
                "id": str(r["id"]),
                "created_at": r["created_at"].isoformat(),
                "recipient": r["recipient"],
                "subject": r["subject"],
                "provider": r["provider"],
                "success": r["success"],
                "error_message": r["error_message"],
            }
            for r in rows
        ]
    }
