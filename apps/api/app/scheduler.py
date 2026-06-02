import asyncio
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


async def _cleanup_expired_unverified_users() -> None:
    """
    Delete user records whose email-activation window has passed without being confirmed.
    Runs every hour so the users table doesn't accumulate stale rows.
    """
    from app.db import get_connection

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM users
                    WHERE email_verified = FALSE
                      AND email_verification_expires_at < NOW()
                    RETURNING email
                    """,
                )
                deleted = cur.fetchall()
            conn.commit()

        if deleted:
            logger.info(
                "Removed %d expired unverified account(s): %s",
                len(deleted),
                [r["email"] for r in deleted],
            )
    except Exception as exc:
        logger.error("Error cleaning up unverified users: %s", exc)


async def run_scheduler() -> None:
    # Run the unverified-user cleanup every hour without waiting for the first scheduled window.
    cleanup_task = asyncio.create_task(_run_hourly_cleanup())

    try:
        while True:
            now = datetime.now(timezone.utc)
            # Daily subscription checks target 08:00 UTC.
            next_run = now.replace(hour=8, minute=0, second=0, microsecond=0)
            if next_run <= now:
                from datetime import timedelta
                next_run += timedelta(days=1)
            wait_seconds = (next_run - now).total_seconds()

            await asyncio.sleep(wait_seconds)

            try:
                from app.services.subscription_service import run_daily_checks
                await asyncio.to_thread(run_daily_checks)
            except Exception as exc:
                logger.error("Daily subscription check error: %s", exc)
    finally:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass


async def _run_hourly_cleanup() -> None:
    while True:
        await _cleanup_expired_unverified_users()
        await asyncio.sleep(3600)
