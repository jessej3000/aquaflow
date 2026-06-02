"""
Multi-provider email service with automatic fallback.

Fallback order:  Resend (primary) → Brevo (secondary) → Gmail SMTP (last resort)

For each send attempt the service:
  1. Checks each provider's current_count against its limit.
     If the provider's reset_date has passed, the counter is reset first.
  2. Skips any provider that has hit its limit.
  3. Tries to send via the first eligible provider.
  4. On success  → increments that provider's counter, logs the attempt, returns.
  5. On API error → logs the failure, tries the next provider.
  6. If all providers are exhausted, raises RuntimeError.

Every attempt (success or failure) is written to the email_logs table.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from app.config import settings
from app.db import get_connection
from app.services.providers.brevo_provider import BrevoProvider
from app.services.providers.gmail_provider import GmailProvider
from app.services.providers.resend_provider import ResendProvider

logger = logging.getLogger(__name__)

# Ordered fallback list — do NOT change the order without updating migration 036 seed.
_PROVIDER_META = [
    {"name": "resend", "limit": 3000, "reset_type": "monthly"},
    {"name": "brevo",  "limit": 9000, "reset_type": "monthly"},
    {"name": "gmail",  "limit": 500,  "reset_type": "daily"},
]


def _build_instances() -> list:
    """Instantiate provider objects from env config."""
    return [
        ResendProvider(api_key=settings.resend_api_key),
        BrevoProvider(api_key=settings.brevo_api_key),
        GmailProvider(user=settings.gmail_user, app_password=settings.gmail_app_password),
    ]


def _next_reset(now: datetime, reset_type: str) -> datetime:
    """Return the next reset timestamp for a given cycle type."""
    if reset_type == "daily":
        # Midnight of the next calendar day (UTC)
        tomorrow = now.replace(hour=0, minute=0, second=0, microsecond=0)
        from datetime import timedelta
        return tomorrow + timedelta(days=1)
    # Monthly — first second of next calendar month (UTC)
    if now.month == 12:
        return now.replace(year=now.year + 1, month=1, day=1,
                           hour=0, minute=0, second=0, microsecond=0)
    return now.replace(month=now.month + 1, day=1,
                       hour=0, minute=0, second=0, microsecond=0)


def _log_attempt(
    cur,
    recipient: str,
    subject: str,
    provider: str,
    success: bool,
    error: Optional[str],
) -> None:
    cur.execute(
        """
        INSERT INTO email_logs (id, created_at, recipient, subject, provider, success, error_message)
        VALUES (%s, NOW(), %s, %s, %s, %s, %s)
        """,
        (str(uuid.uuid4()), recipient, subject, provider, success, error),
    )


def send_email(
    to: str,
    subject: str,
    body: str,
    from_name: Optional[str] = None,
) -> str:
    """
    Send an email through the fallback chain.

    Returns the name of the provider that successfully delivered the message.
    Raises RuntimeError if every provider fails or is over its limit.
    """
    if from_name is None:
        from_name = settings.smtp_from.split("<")[0].strip() or "Watermaster"

    from_addr = settings.smtp_from
    now = datetime.now(timezone.utc)
    providers = _build_instances()

    with get_connection() as conn:
        for provider_obj in providers:
            with conn.cursor() as cur:
                # ── Fetch current provider record ──────────────────────────────
                cur.execute(
                    "SELECT current_count, monthly_limit, reset_type, reset_date "
                    "FROM email_providers WHERE name = %s FOR UPDATE",
                    (provider_obj.name,),
                )
                row = cur.fetchone()

            if row is None:
                # Provider not seeded yet — skip gracefully.
                logger.warning("email_providers row missing for '%s'", provider_obj.name)
                continue

            current_count = row["current_count"]
            limit = row["monthly_limit"]
            reset_date = row["reset_date"]

            # ── Auto-reset if the reset period has rolled over ─────────────────
            if now >= reset_date:
                new_reset = _next_reset(now, row["reset_type"])
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE email_providers SET current_count = 0, reset_date = %s, "
                        "last_updated = NOW() WHERE name = %s",
                        (new_reset, provider_obj.name),
                    )
                conn.commit()
                current_count = 0
                logger.info("Reset counter for provider '%s'", provider_obj.name)

            # ── Skip providers that have hit their limit ────────────────────────
            if current_count >= limit:
                logger.info(
                    "Skipping '%s': limit reached (%d/%d)", provider_obj.name, current_count, limit
                )
                continue

            # ── Attempt delivery ───────────────────────────────────────────────
            try:
                provider_obj.send(to=to, subject=subject, body=body,
                                  from_addr=from_addr, from_name=from_name)
            except Exception as exc:
                err_msg = str(exc)
                logger.error("Provider '%s' error for %s: %s", provider_obj.name, to, err_msg)
                with conn.cursor() as cur:
                    _log_attempt(cur, to, subject, provider_obj.name, False, err_msg)
                conn.commit()
                continue  # try next provider

            # ── Success: increment counter and log ─────────────────────────────
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE email_providers SET current_count = current_count + 1, "
                    "last_updated = NOW() WHERE name = %s",
                    (provider_obj.name,),
                )
                _log_attempt(cur, to, subject, provider_obj.name, True, None)
            conn.commit()

            logger.info("Email sent via '%s' to %s", provider_obj.name, to)
            return provider_obj.name

    raise RuntimeError(
        f"All email providers exhausted for recipient {to!r}. "
        "Check email_logs for individual provider errors."
    )


def get_provider_status() -> list[dict]:
    """Return usage stats for all three providers (used by GET /api/email-status)."""
    now = datetime.now(timezone.utc)
    result = []

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT name, current_count, monthly_limit, reset_type, reset_date, last_updated "
                "FROM email_providers ORDER BY id"
            )
            rows = cur.fetchall()

    for row in rows:
        count = row["current_count"]
        limit = row["monthly_limit"]

        # Reset has rolled over — show 0 until the app actually sends something.
        if now >= row["reset_date"]:
            count = 0

        pct = round((count / limit) * 100, 1) if limit else 0
        if pct >= 90:
            status = "red"
        elif pct >= 70:
            status = "yellow"
        else:
            status = "green"

        result.append({
            "name": row["name"],
            "current_count": count,
            "limit": limit,
            "percentage": pct,
            "status": status,
            "reset_type": row["reset_type"],
            "reset_date": row["reset_date"].isoformat(),
            "last_updated": row["last_updated"].isoformat() if row["last_updated"] else None,
            "available": count < limit,
        })

    return result


