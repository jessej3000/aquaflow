"""
Notification helpers that compose HTML email bodies and dispatch them
through the multi-provider email_service (Resend → Brevo → Gmail fallback).
"""

import logging
from typing import Optional

from app.config import settings
from app.services.email_service import send_email

logger = logging.getLogger(__name__)


def _dispatch(to_email: str, subject: str, html_body: str) -> None:
    """Fire-and-forget wrapper — logs but never raises so callers stay clean."""
    try:
        provider = send_email(to=to_email, subject=subject, body=html_body)
        logger.info("Notification '%s' delivered via %s to %s", subject, provider, to_email)
    except Exception as exc:
        logger.error("Failed to send notification '%s' to %s: %s", subject, to_email, exc)


def send_email_verification(email: str, name: str, token: str) -> None:
    subject = "Verify your Smartaquaph account"
    verify_url = f"{settings.app_url}/verify-email?token={token}"
    display_name = name or email
    html_body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#1a56db">Verify your email address</h2>
      <p>Hi {display_name},</p>
      <p>Thanks for signing up for Smartaquaph. Please verify your email address to activate your account.</p>
      <a href="{verify_url}"
         style="display:inline-block;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
        Verify Email
      </a>
      <p style="color:#6b7280;margin-top:24px;font-size:13px">
        This link expires in 24 hours. If you did not create an account, you can ignore this email.
      </p>
    </div>
    """
    _send(email, subject, html_body)


def send_renewal_reminder(email: str, name: str, plan: str, days_left: int) -> None:
    subject = (
        f"Your Smartaquaph {plan} subscription expires in "
        f"{days_left} day{'s' if days_left != 1 else ''}"
    )
    html_body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#1a56db">Smartaquaph Subscription Reminder</h2>
      <p>Hi {name},</p>
      <p>Your <strong>{plan}</strong> subscription will expire in
         <strong>{days_left} day{'s' if days_left != 1 else ''}</strong>.</p>
      <p>Renew now to avoid any interruption to your service.</p>
      <a href="{settings.app_url}/settings/billing"
         style="display:inline-block;padding:12px 24px;background:#1a56db;color:#fff;
                border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
        Renew Subscription
      </a>
      <p style="color:#6b7280;margin-top:24px;font-size:12px">
        If you have any questions, reply to this email.
      </p>
    </div>
    """
    _dispatch(email, subject, html_body)


def send_expiry_notice(email: str, name: str, plan: str) -> None:
    subject = f"Your Smartaquaph {plan} subscription has expired"
    html_body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#e02424">Smartaquaph Subscription Expired</h2>
      <p>Hi {name},</p>
      <p>Your <strong>{plan}</strong> subscription has expired.
         Access to Smartaquaph has been suspended.</p>
      <p>Renew your subscription to restore access immediately.</p>
      <a href="{settings.app_url}/settings/billing"
         style="display:inline-block;padding:12px 24px;background:#1a56db;color:#fff;
                border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
        Renew Now
      </a>
      <p style="color:#6b7280;margin-top:24px;font-size:12px">
        If you have any questions, reply to this email.
      </p>
    </div>
    """
    _dispatch(email, subject, html_body)


def send_activation_email(email: str, full_name: Optional[str], token: str) -> None:
    """Send the account-activation email to a newly registered user."""
    name = full_name or "there"
    activation_url = f"{settings.app_url}/activate/{token}"
    subject = "Activate your Smartaquaph account"
    html_body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#1a56db">Welcome to Smartaquaph!</h2>
      <p>Hi {name},</p>
      <p>Thanks for signing up. Please activate your account by clicking the button below.</p>
      <p>This link expires in <strong>3 days</strong>.</p>
      <a href="{activation_url}"
         style="display:inline-block;padding:14px 28px;background:#1a56db;color:#fff;
                border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;
                font-size:16px">
        Activate Account
      </a>
      <p style="color:#6b7280;margin-top:24px;font-size:13px">
        Or paste this link in your browser:<br>
        <a href="{activation_url}" style="color:#1a56db">{activation_url}</a>
      </p>
      <p style="color:#9ca3af;margin-top:16px;font-size:12px">
        If you did not create an account you can safely ignore this email.
      </p>
    </div>
    """
    _dispatch(email, subject, html_body)


