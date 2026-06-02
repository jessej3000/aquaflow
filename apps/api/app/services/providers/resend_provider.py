import logging

import resend as resend_sdk

from .base import BaseEmailProvider

logger = logging.getLogger(__name__)


class ResendProvider(BaseEmailProvider):
    """Primary provider — 3,000 emails/month (free tier), resets on the 1st of each month."""

    name = "resend"
    limit = 3000
    reset_type = "monthly"

    def __init__(self, api_key: str) -> None:
        resend_sdk.api_key = api_key

    def send(self, to: str, subject: str, body: str, from_addr: str, from_name: str) -> None:
        params: resend_sdk.Emails.SendParams = {
            "from": f"{from_name} <{from_addr}>",
            "to": [to],
            "subject": subject,
            "html": body,
        }
        response = resend_sdk.Emails.send(params)
        logger.info("resend: delivered to %s (id=%s)", to, response.get("id"))
