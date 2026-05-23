import asyncio
from datetime import datetime, timezone


async def run_scheduler() -> None:
    while True:
        now = datetime.now(timezone.utc)
        # Target 08:00 UTC daily
        next_run = now.replace(hour=8, minute=0, second=0, microsecond=0)
        if next_run <= now:
            next_run = next_run.replace(day=next_run.day + 1)
        wait_seconds = (next_run - now).total_seconds()

        await asyncio.sleep(wait_seconds)

        try:
            from app.services.subscription_service import run_daily_checks
            await asyncio.to_thread(run_daily_checks)
        except Exception:
            pass
