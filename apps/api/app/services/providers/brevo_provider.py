import logging

import httpx

from .base import BaseEmailProvider

logger = logging.getLogger(__name__)

_API_URL = "https://api.brevo.com/v3/smtp/email"


class BrevoProvider(BaseEmailProvider):
    """Secondary provider — 9,000 emails/month (free tier), resets on the 1st of each month."""

    name = "brevo"
    limit = 9000
    reset_type = "monthly"

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    def send(self, to: str, subject: str, body: str, from_addr: str, from_name: str) -> None:
        headers = {
            "accept": "application/json",
            "api-key": self._api_key,
            "content-type": "application/json",
        }
        payload = {
            "sender": {"name": from_name, "email": from_addr},
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": body,
        }
        response = httpx.post(_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        logger.info("brevo: delivered to %s (messageId=%s)", to, data.get("messageId"))
