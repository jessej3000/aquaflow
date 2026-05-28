import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings


def _send(to_email: str, subject: str, html_body: str) -> None:
    if not settings.smtp_host:
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        if settings.smtp_port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, context=context) as server:
                if settings.smtp_user:
                    server.login(settings.smtp_user, settings.smtp_password)
                server.sendmail(settings.smtp_from, to_email, msg.as_string())
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.ehlo()
                server.starttls()
                if settings.smtp_user:
                    server.login(settings.smtp_user, settings.smtp_password)
                server.sendmail(settings.smtp_from, to_email, msg.as_string())
    except Exception:
        pass


def send_email_verification(email: str, name: str, token: str) -> None:
    subject = "Verify your Watermaster account"
    verify_url = f"{settings.app_url}/verify-email?token={token}"
    display_name = name or email
    html_body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#1a56db">Verify your email address</h2>
      <p>Hi {display_name},</p>
      <p>Thanks for signing up for Watermaster. Please verify your email address to activate your account.</p>
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
    subject = f"Your Watermaster {plan} subscription expires in {days_left} day{'s' if days_left != 1 else ''}"
    html_body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#1a56db">Watermaster Subscription Reminder</h2>
      <p>Hi {name},</p>
      <p>Your <strong>{plan}</strong> subscription will expire in <strong>{days_left} day{'s' if days_left != 1 else ''}</strong>.</p>
      <p>Renew now to avoid any interruption to your service.</p>
      <a href="{settings.app_url}/settings/billing"
         style="display:inline-block;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
        Renew Subscription
      </a>
      <p style="color:#6b7280;margin-top:24px;font-size:12px">
        If you have any questions, reply to this email.
      </p>
    </div>
    """
    _send(email, subject, html_body)


def send_expiry_notice(email: str, name: str, plan: str) -> None:
    subject = f"Your Watermaster {plan} subscription has expired"
    html_body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#e02424">Watermaster Subscription Expired</h2>
      <p>Hi {name},</p>
      <p>Your <strong>{plan}</strong> subscription has expired. Access to Watermaster has been suspended.</p>
      <p>Renew your subscription to restore access immediately.</p>
      <a href="{settings.app_url}/settings/billing"
         style="display:inline-block;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
        Renew Now
      </a>
      <p style="color:#6b7280;margin-top:24px;font-size:12px">
        If you have any questions, reply to this email.
      </p>
    </div>
    """
    _send(email, subject, html_body)
