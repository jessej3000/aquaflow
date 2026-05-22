from typing import Any, Optional
import base64
import hashlib
import hmac
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from fastapi import APIRouter, Header, HTTPException, Request as FastAPIRequest, status
from pydantic import BaseModel

from app.config import settings
from app.db import get_connection
from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

router = APIRouter(prefix="/payments", tags=["payments"])

PAYMONGO_BASE = "https://api.paymongo.com/v1"


def _pm_headers() -> dict[str, str]:
    creds = base64.b64encode(f"{settings.paymongo_secret_key}:".encode()).decode()
    return {
        "Authorization": f"Basic {creds}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _pm_request(method: str, path: str, payload: Optional[dict] = None) -> dict:
    url = f"{PAYMONGO_BASE}{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = Request(url, data=data, headers=_pm_headers(), method=method)
    try:
        with urlopen(req) as resp:
            return json.loads(resp.read())
    except HTTPError as exc:
        body: dict = {}
        try:
            body = json.loads(exc.read())
        except Exception:
            pass
        errors = body.get("errors", [])
        detail = errors[0].get("detail", "PayMongo API error") if errors else "PayMongo API error"
        raise HTTPException(status_code=exc.code, detail=detail) from exc


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


def _mark_paid(session_id: str, ref_type: str, ref_id: int, method: Optional[str]) -> None:
    table = "orders" if ref_type == "order" else "sales"
    paid_method = method or "gcash"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE payments SET status='paid', payment_method=%s, updated_at=NOW() WHERE paymongo_session_id=%s",
                (paid_method, session_id),
            )
            cur.execute(
                f"UPDATE {table} SET payment_status='paid', payment_method=%s, updated_at=NOW() WHERE id=%s",
                (paid_method, ref_id),
            )
        conn.commit()


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class CheckoutRequest(BaseModel):
    reference_type: str   # 'order' | 'sale'
    reference_id: int
    amount: float         # PHP (converted to centavos internally)
    description: str
    customer_name: Optional[str] = None
    success_url: str
    cancel_url: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/checkout")
def create_checkout(
    payload: CheckoutRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current = _require_user(authorization)

    if payload.reference_type not in ("order", "sale"):
        raise HTTPException(status_code=400, detail="reference_type must be 'order' or 'sale'")

    if not settings.paymongo_secret_key:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    amount_centavos = int(round(payload.amount * 100))
    if amount_centavos < 2000:
        raise HTTPException(status_code=400, detail="Minimum payment amount is PHP 20.00")

    session_body: dict[str, Any] = {
        "data": {
            "attributes": {
                "line_items": [
                    {
                        "currency": "PHP",
                        "amount": amount_centavos,
                        "name": payload.description[:255],
                        "quantity": 1,
                    }
                ],
                "payment_method_types": ["gcash", "paymaya", "card", "grab_pay", "qrph"],
                "success_url": payload.success_url,
                "cancel_url": payload.cancel_url,
                "description": payload.description[:255],
                "reference_number": f"{payload.reference_type[:3].upper()}-{payload.reference_id}",
                "metadata": {
                    "reference_type": payload.reference_type,
                    "reference_id": str(payload.reference_id),
                    "tenant_id": current["tenant_id"],
                },
            }
        }
    }

    if payload.customer_name:
        session_body["data"]["attributes"]["billing"] = {"name": payload.customer_name[:255]}

    pm = _pm_request("POST", "/checkout_sessions", session_body)

    session_id: str = pm["data"]["id"]
    checkout_url: str = pm["data"]["attributes"]["checkout_url"]

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO payments
                  (tenant_id, reference_type, reference_id, paymongo_session_id, amount, checkout_url)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (paymongo_session_id) DO NOTHING
                """,
                (
                    current["tenant_id"],
                    payload.reference_type,
                    payload.reference_id,
                    session_id,
                    payload.amount,
                    checkout_url,
                ),
            )
        conn.commit()

    return {"session_id": session_id, "checkout_url": checkout_url}


@router.get("/checkout/{session_id}")
def get_checkout_status(
    session_id: str,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    current = _require_user(authorization)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT status, reference_type, reference_id, payment_method
                FROM payments
                WHERE paymongo_session_id = %s AND tenant_id = %s
                """,
                (session_id, current["tenant_id"]),
            )
            rec = cur.fetchone()

    if not rec:
        raise HTTPException(status_code=404, detail="Payment session not found")

    if rec["status"] == "paid":
        return {
            "status": "paid",
            "reference_type": rec["reference_type"],
            "reference_id": rec["reference_id"],
            "payment_method": rec["payment_method"],
        }

    # Fetch live status from PayMongo
    pm = _pm_request("GET", f"/checkout_sessions/{session_id}")
    attrs = pm["data"]["attributes"]
    pi_status: str = attrs.get("payment_intent", {}).get("attributes", {}).get("status", "")
    pm_payments: list = attrs.get("payments", [])

    payment_method: Optional[str] = None
    if pm_payments:
        source = pm_payments[0].get("data", {}).get("attributes", {}).get("source", {})
        payment_method = source.get("type")

    if pi_status == "succeeded":
        _mark_paid(session_id, rec["reference_type"], rec["reference_id"], payment_method)
        return {
            "status": "paid",
            "reference_type": rec["reference_type"],
            "reference_id": rec["reference_id"],
            "payment_method": payment_method,
        }

    mapped = "expired" if attrs.get("status") == "expired" else "pending"
    return {
        "status": mapped,
        "reference_type": rec["reference_type"],
        "reference_id": rec["reference_id"],
        "payment_method": None,
    }


@router.post("/webhook")
async def paymongo_webhook(request: FastAPIRequest) -> dict[str, str]:
    body = await request.body()

    # Signature verification (only when webhook secret is configured)
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

    event_type: str = (
        event.get("data", {}).get("attributes", {}).get("type", "")
    )

    if event_type == "checkout_session.payment.paid":
        session_data = event["data"]["attributes"].get("data", {})
        session_id: str = session_data.get("id", "")
        session_attrs = session_data.get("attributes", {})
        pm_payments: list = session_attrs.get("payments", [])

        payment_method: Optional[str] = None
        if pm_payments:
            source = pm_payments[0].get("data", {}).get("attributes", {}).get("source", {})
            payment_method = source.get("type")

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT reference_type, reference_id FROM payments WHERE paymongo_session_id = %s",
                    (session_id,),
                )
                rec = cur.fetchone()

        if rec:
            _mark_paid(session_id, rec["reference_type"], rec["reference_id"], payment_method)

    return {"status": "ok"}
