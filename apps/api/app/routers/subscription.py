import hashlib
import hmac
import json
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request as FastAPIRequest, status
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
    description = f"Smartaquaph {plan_label} Plan — {cycle_label}"

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


def _verify_signature(body: bytes, sig_header: str, secret: str) -> bool:
    """
    PayMongo signature format: t=<timestamp>,te=<test_sig>,li=<live_sig>
    Message to sign: <timestamp>.<raw_body>
    Algorithm: HMAC-SHA256
    """
    parts = {}
    for part in sig_header.split(","):
        if "=" in part:
            k, v = part.split("=", 1)
            parts[k.strip()] = v.strip()

    timestamp = parts.get("t", "")
    if not timestamp:
        return False

    message = f"{timestamp}.{body.decode('utf-8', errors='replace')}"
    expected = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()

    # Accept either the test signature (te) or live signature (li)
    for key in ("te", "li"):
        received = parts.get(key, "")
        if received and hmac.compare_digest(received, expected):
            return True

    return False


def _extract_billing(attrs: dict) -> dict:
    billing = attrs.get("billing") or {}
    return {
        "name": billing.get("name"),
        "email": billing.get("email"),
        "phone": billing.get("phone"),
    }


def _process_webhook(event: dict) -> None:
    attrs = event.get("data", {}).get("attributes", {})
    event_type: str = attrs.get("type", "")
    data: dict = attrs.get("data", {})
    data_attrs: dict = data.get("attributes", {})

    if event_type == "link.payment.paid":
        link_id: str = data.get("id", "")
        payments: list = data_attrs.get("payments", [])
        if not link_id or not payments:
            return
        pay = payments[0]
        payment_id: str = pay.get("id", "")
        pay_attrs: dict = pay.get("attributes", {})
        billing = _extract_billing(pay_attrs)
        amount: int = pay_attrs.get("amount", 0)

        subscription_service.activate_subscription(
            link_id,
            payment_id,
            event_type=event_type,
            amount_centavos=amount,
            billing_name=billing["name"],
            billing_email=billing["email"],
            billing_phone=billing["phone"],
        )

    elif event_type == "payment.paid":
        payment_id = data.get("id", "")
        if not payment_id:
            return
        billing = _extract_billing(data_attrs)
        amount = data_attrs.get("amount", 0)
        source: dict = data_attrs.get("source") or {}
        source_link_id: Optional[str] = source.get("id") if source.get("type") == "link" else None
        metadata: dict = data_attrs.get("metadata") or {}
        tenant_id: Optional[str] = metadata.get("tenant_id")

        subscription_service.activate_subscription_by_payment(
            payment_id,
            source_link_id,
            tenant_id,
            event_type=event_type,
            amount_centavos=amount,
            billing_name=billing["name"],
            billing_email=billing["email"],
            billing_phone=billing["phone"],
        )

    elif event_type == "subscription.cycle.completed":
        sub_data_attrs: dict = data_attrs
        metadata = sub_data_attrs.get("metadata") or {}
        tenant_id = metadata.get("tenant_id")
        paymongo_sub_id: str = data.get("id", "")
        # Extract payment from latest_invoice if present
        invoice: dict = sub_data_attrs.get("latest_invoice") or {}
        invoice_payments: list = invoice.get("payments") or []
        payment_id = invoice_payments[0].get("id", "") if invoice_payments else paymongo_sub_id
        inv_pay_attrs: dict = invoice_payments[0].get("attributes", {}) if invoice_payments else {}
        amount = inv_pay_attrs.get("amount", 0)
        billing = _extract_billing(inv_pay_attrs)

        subscription_service.extend_subscription_cycle(
            tenant_id,
            paymongo_sub_id,
            payment_id,
            amount_centavos=amount,
            billing_name=billing["name"],
            billing_email=billing["email"],
            billing_phone=billing["phone"],
        )


@router.post("/webhook")
async def subscription_webhook(
    request: FastAPIRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, str]:
    body = await request.body()

    # Verify signature before touching the payload
    if settings.paymongo_webhook_secret:
        sig_header = request.headers.get("Paymongo-Signature", "")
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing Paymongo-Signature header")
        if not _verify_signature(body, sig_header, settings.paymongo_webhook_secret):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        event = json.loads(body)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON payload") from exc

    # Return 200 immediately; process asynchronously in background
    background_tasks.add_task(_process_webhook, event)
    return {"status": "ok"}
