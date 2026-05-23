from datetime import datetime, timedelta, timezone
from typing import Optional

from app.db import get_connection
from app.services.notification_service import send_renewal_reminder, send_expiry_notice

PLANS: dict[str, dict[str, int]] = {
    "entry": {"monthly": 4900, "yearly": 49000},
    "mid":   {"monthly": 12900, "yearly": 129000},
}
PLAN_LABELS: dict[str, str] = {"entry": "Entry", "mid": "Mid"}
TRIAL_DAYS = 30
REMINDER_DAYS = 10


def get_subscription(tenant_id: str) -> Optional[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM subscriptions WHERE tenant_id = %s",
                (tenant_id,),
            )
            return cur.fetchone()


def get_or_create_trial(user_id: str, tenant_id: str) -> dict:
    existing = get_subscription(tenant_id)
    if existing:
        return dict(existing)

    end_date = datetime.now(timezone.utc) + timedelta(days=TRIAL_DAYS)
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO subscriptions (user_id, tenant_id, plan_type, billing_cycle, status, end_date)
                VALUES (%s, %s, 'entry', 'monthly', 'trial', %s)
                ON CONFLICT (tenant_id) DO UPDATE SET updated_at = subscriptions.updated_at
                RETURNING *
                """,
                (user_id, tenant_id, end_date),
            )
            row = cur.fetchone()
        conn.commit()
    return dict(row)


def check_access(tenant_id: str, user_id: str) -> tuple[bool, str]:
    sub = get_or_create_trial(user_id, tenant_id)
    status = sub["status"]
    end_date: datetime = sub["end_date"]
    now = datetime.now(timezone.utc)

    if status == "expired":
        return False, "Subscription expired. Please renew to continue."
    if end_date < now:
        _set_expired(sub["id"])
        return False, "Subscription expired. Please renew to continue."
    return True, ""


def _set_expired(sub_id: str) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE subscriptions SET status='expired', updated_at=NOW() WHERE id=%s",
                (sub_id,),
            )
        conn.commit()


def upsert_pending_link(
    tenant_id: str,
    user_id: str,
    plan_type: str,
    billing_cycle: str,
    link_id: str,
) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO subscriptions
                  (user_id, tenant_id, plan_type, billing_cycle, status, end_date, paymongo_link_id)
                VALUES (%s, %s, %s, %s, 'trial', NOW() + INTERVAL '30 days', %s)
                ON CONFLICT (tenant_id) DO UPDATE
                  SET plan_type          = EXCLUDED.plan_type,
                      billing_cycle      = EXCLUDED.billing_cycle,
                      paymongo_link_id   = EXCLUDED.paymongo_link_id,
                      updated_at         = NOW()
                """,
                (user_id, tenant_id, plan_type, billing_cycle, link_id),
            )
        conn.commit()


def activate_subscription(link_id: str, payment_id: str) -> Optional[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM subscriptions WHERE paymongo_link_id = %s",
                (link_id,),
            )
            sub = cur.fetchone()
        if not sub:
            return None

        billing_cycle = sub["billing_cycle"]
        now = datetime.now(timezone.utc)
        if billing_cycle == "yearly":
            new_end = now + timedelta(days=365)
        else:
            new_end = now + timedelta(days=30)

        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE subscriptions
                SET status               = 'active',
                    start_date           = %s,
                    end_date             = %s,
                    paymongo_payment_id  = %s,
                    reminder_sent        = FALSE,
                    updated_at           = NOW()
                WHERE paymongo_link_id = %s
                RETURNING *
                """,
                (now, new_end, payment_id, link_id),
            )
            updated = cur.fetchone()
        conn.commit()
    return dict(updated) if updated else None


def run_daily_checks() -> None:
    now = datetime.now(timezone.utc)
    reminder_threshold = now + timedelta(days=REMINDER_DAYS)

    with get_connection() as conn:
        with conn.cursor() as cur:
            # Mark expired subscriptions
            cur.execute(
                """
                UPDATE subscriptions
                SET status = 'expired', updated_at = NOW()
                WHERE status IN ('active', 'expiring_soon', 'trial')
                  AND end_date < %s
                RETURNING tenant_id, plan_type
                """,
                (now,),
            )
            newly_expired = cur.fetchall()

            # Mark expiring_soon
            cur.execute(
                """
                UPDATE subscriptions
                SET status = 'expiring_soon', updated_at = NOW()
                WHERE status = 'active'
                  AND end_date BETWEEN %s AND %s
                """,
                (now, reminder_threshold),
            )

            # Fetch subscriptions needing reminder
            cur.execute(
                """
                SELECT s.id, s.tenant_id, s.plan_type, s.end_date,
                       u.email, u.full_name
                FROM subscriptions s
                JOIN users u ON u.id = s.user_id
                WHERE s.status IN ('active', 'expiring_soon', 'trial')
                  AND s.end_date BETWEEN %s AND %s
                  AND s.reminder_sent = FALSE
                """,
                (now, reminder_threshold),
            )
            remind_rows = cur.fetchall()

        conn.commit()

    # Send expiry notices
    with get_connection() as conn:
        for row in newly_expired:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT u.email, u.full_name FROM subscriptions s JOIN users u ON u.id = s.user_id WHERE s.tenant_id = %s",
                    (row["tenant_id"],),
                )
                user = cur.fetchone()
            if user:
                send_expiry_notice(user["email"], user["full_name"], PLAN_LABELS.get(row["plan_type"], row["plan_type"]))

    # Send renewal reminders
    with get_connection() as conn:
        for row in remind_rows:
            days_left = max(0, (row["end_date"] - now).days)
            send_renewal_reminder(
                row["email"],
                row["full_name"],
                PLAN_LABELS.get(row["plan_type"], row["plan_type"]),
                days_left,
            )
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE subscriptions SET reminder_sent = TRUE, updated_at = NOW() WHERE id = %s",
                    (row["id"],),
                )
        conn.commit()
