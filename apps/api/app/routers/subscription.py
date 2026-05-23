import hashlib
import hmac
import json
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Request as FastAPIRequest, status
from pydantic import BaseModel

from app.config import settings
from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked
from app.services import paymongo_service, subscription_service

router = APIRouter(prefix="/subscription", tags=["subscription"])

AVAILABLE_PLANS = [
    {
        "key": "entry",
        "name": "Entry",
        "monthly_price": 49,
        "yearly_price": 490,
        "features": ["1 branch", "Up to 500 orders/month", "Basic analytics", "Email support"],
    },
    {
        "key": "mid",
        "name": "Mid",
        "monthly_price": 129,
        "yearly_price": 1290,
        "features": ["Unlimited branches", "Unlimited orders", "Advanced analytics", "Priority support"],
    },
]


def _require_user(authorization: Optional[str]) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required")
    token = authorization.removeprefix("Bearer ").strip()
    if is_token_revoked(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    try:
        claims = decode_token(token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    user_id = claims.get("sub")
    tenant_id = claims.get("tenant_id")
    if not user_id or not tenant_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, tenant_id, role FROM users WHERE id = %s AND is_active = TRUE",
                (user_id,),
            )
            user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return {"id": str(user["id"]), "tenant_id": str(user["tenant_id"]), "role": user["role"]}


class SubscribeRequest(BaseModel):
    plan_type: str       # 'entry' | 'mid'
    billing_cycle: str   # 'monthly' | 'yearly'


@router.get("/status")
def get_status(
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current = _require_user(authorization)
    sub = subscription_service.get_or_create_trial(current["id"], current["tenant_id"])

    now = datetime.now(timezone.utc)
    end_date: datetime = sub["end_date"]
    days_remaining = max(0, (end_date - now).days)

    return {
        "status": sub["status"],
        "plan_type": sub["plan_type"],
        "billing_cycle": sub["billing_cycle"],
        "end_date": end_date.isoformat(),
        "days_remaining": days_remaining,
        "available_plans": AVAILABLE_PLANS,
    }


@router.post("/subscribe")
def subscribe(
    payload: SubscribeRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current = _require_user(authorization)

    if payload.plan_type not in subscription_service.PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan_type. Must be 'entry' or 'mid'.")
    if payload.billing_cycle not in ("monthly", "yearly"):
        raise HTTPException(status_code=400, detail="Invalid billing_cycle. Must be 'monthly' or 'yearly'.")

    if not settings.paymongo_secret_key:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    amount_centavos = subscription_service.PLANS[payload.plan_type][payload.billing_cycle]
    plan_label = subscription_service.PLAN_LABELS[payload.plan_type]
    cycle_label = "Monthly" if payload.billing_cycle == "monthly" else "Yearly"
    description = f"Watermaster {plan_label} Plan — {cycle_label}"

    redirect_success = f"{settings.app_url}/?pm_sub=success&plan={payload.plan_type}"
    redirect_failed = f"{settings.app_url}/?pm_sub=failed"
    try:
        link = paymongo_service.create_payment_link(amount_centavos, description, redirect_success, redirect_failed)
    except HTTPException as exc:
        status_code = 502 if exc.status_code in (401, 403) else exc.status_code
        raise HTTPException(status_code=status_code, detail=f"Payment gateway error: {exc.detail}") from exc

    subscription_service.upsert_pending_link(
        current["tenant_id"],
        current["id"],
        payload.plan_type,
        payload.billing_cycle,
        link["link_id"],
    )

    return {
        "link_id": link["link_id"],
        "checkout_url": link["checkout_url"],
        "amount": amount_centavos / 100,
        "plan_type": payload.plan_type,
        "billing_cycle": payload.billing_cycle,
    }


@router.post("/renew")
def renew(
    payload: SubscribeRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    return subscribe(payload, authorization)


@router.post("/webhook")
async def subscription_webhook(request: FastAPIRequest) -> dict[str, str]:
    body = await request.body()

    if settings.paymongo_webhook_secret:
        sig_header = request.headers.get("Paymongo-Signature", "")
        parts = {k: v for part in sig_header.split(",") for k, v in [part.split("=", 1)] if "=" in part}
        timestamp = parts.get("t", "")
        received_sig = parts.get("te", "")
        message = f"{timestamp}.{body.decode()}"
        expected_sig = hmac.new(
            settings.paymongo_webhook_secret.encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(received_sig, expected_sig):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        event = json.loads(body)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON") from exc

    event_type: str = event.get("data", {}).get("attributes", {}).get("type", "")

    if event_type == "link.payment.paid":
        link_data = event.get("data", {}).get("attributes", {}).get("data", {})
        link_id: str = link_data.get("id", "")
        payments: list = link_data.get("attributes", {}).get("payments", [])
        payment_id: str = payments[0].get("id", "") if payments else ""

        if link_id:
            subscription_service.activate_subscription(link_id, payment_id)

    return {"status": "ok"}
