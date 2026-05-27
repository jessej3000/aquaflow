import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from .base import BaseEmailProvider

logger = logging.getLogger(__name__)


class GmailProvider(BaseEmailProvider):
    """Last-resort provider — 500 emails/day via Gmail SMTP App Password, resets daily."""

    name = "gmail"
    limit = 500
    reset_type = "daily"

    def __init__(self, user: str, app_password: str) -> None:
        self._user = user
        self._app_password = app_password

    def send(self, to: str, subject: str, body: str, from_addr: str, from_name: str) -> None:
        # Gmail always sends from the authenticated account regardless of from_addr.
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{self._user}>"
        msg["To"] = to
        msg.attach(MIMEText(body, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(self._user, self._app_password)
            server.sendmail(self._user, [to], msg.as_string())

        logger.info("gmail: delivered to %s", to)
