import base64
import json
from typing import Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from fastapi import HTTPException

from app.config import settings

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


def create_payment_link(
    amount_centavos: int,
    description: str,
    redirect_success: Optional[str] = None,
    redirect_failed: Optional[str] = None,
) -> dict[str, str]:
    attrs: dict = {
        "amount": amount_centavos,
        "currency": "PHP",
        "description": description[:255],
    }
    if redirect_success or redirect_failed:
        attrs["redirect"] = {
            "success": redirect_success or "",
            "failed": redirect_failed or "",
        }
    payload = {"data": {"attributes": attrs}}
    result = _pm_request("POST", "/links", payload)
    link_data = result["data"]
    return {
        "link_id": link_data["id"],
        "checkout_url": link_data["attributes"]["checkout_url"],
    }


def get_payment_link(link_id: str) -> dict:
    result = _pm_request("GET", f"/links/{link_id}")
    return result["data"]
