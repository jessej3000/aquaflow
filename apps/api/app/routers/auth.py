import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from psycopg.errors import UniqueViolation

from app.db import get_connection
from app.lib.security import create_access_token, decode_token, hash_password, verify_password
from app.lib.token_blocklist import is_token_revoked, revoke_token

router = APIRouter(prefix="/auth", tags=["auth"])

_ACTIVATION_TTL_DAYS = 3


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None


class SigninRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


def _get_bearer_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization Bearer token is required",
        )

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization Bearer token is required",
        )
    return token


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest) -> dict[str, Any]:
    tenant_id = str(uuid.uuid4())
    normalized_email = payload.email.lower()
    password_hash = hash_password(payload.password)
    verification_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=_ACTIVATION_TTL_DAYS)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Reject if an active, verified account already exists for this email.
                cur.execute(
                    """
                    SELECT 1
                    FROM users
                    WHERE email = %s AND is_active = TRUE AND email_verified = TRUE
                    LIMIT 1
                    """,
                    (normalized_email,),
                )
                if cur.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email is already registered",
                    )

                # If a pending (unverified) account exists, refresh its token and resend.
                cur.execute(
                    """
                    SELECT id, full_name FROM users
                    WHERE email = %s AND email_verified = FALSE
                    LIMIT 1
                    """,
                    (normalized_email,),
                )
                pending = cur.fetchone()
                if pending:
                    cur.execute(
                        """
                        UPDATE users
                        SET email_verification_token = %s,
                            email_verification_expires_at = %s,
                            updated_at = NOW()
                        WHERE id = %s
                        """,
                        (verification_token, expires_at, pending["id"]),
                    )
                    conn.commit()
                    # Send fresh activation email outside the transaction.
                    from app.services.notification_service import send_activation_email
                    send_activation_email(
                        email=normalized_email,
                        full_name=pending["full_name"],
                        token=verification_token,
                    )
                    return {
                        "message": (
                            "A new activation link has been sent to your email. "
                            "Please check your inbox."
                        )
                    }

                # Brand-new registration — create user with email_verified = FALSE.
                cur.execute(
                    """
                    INSERT INTO users
                        (tenant_id, email, password_hash, full_name,
                         email_verified, email_verification_token, email_verification_expires_at)
                    VALUES (%s, %s, %s, %s, FALSE, %s, %s)
                    RETURNING id, full_name
                    """,
                    (
                        tenant_id,
                        normalized_email,
                        password_hash,
                        payload.full_name,
                        verification_token,
                        expires_at,
                    ),
                )
                new_user = cur.fetchone()
            conn.commit()

    except UniqueViolation as ex:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        ) from ex

    # Send activation email after the DB transaction commits.
    from app.services.notification_service import send_activation_email
    send_activation_email(
        email=normalized_email,
        full_name=new_user["full_name"],
        token=verification_token,
    )

    return {
        "message": (
            "Registration successful. Please check your email to activate your account. "
            f"The link expires in {_ACTIVATION_TTL_DAYS} days."
        )
    }


@router.get("/activate/{token}", status_code=status.HTTP_200_OK)
def activate_account(token: str) -> dict[str, str]:
    """Click the link from the activation email to verify the account."""
    now = datetime.now(timezone.utc)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, email_verified, email_verification_expires_at
                FROM users
                WHERE email_verification_token = %s
                LIMIT 1
                """,
                (token,),
            )
            user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or expired activation link.",
            )

        if user["email_verified"]:
            return {"message": "Account is already activated. You can sign in."}

        # Expired token — delete the unverified account so the user can re-register.
        if now > user["email_verification_expires_at"]:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM users WHERE id = %s", (user["id"],))
            conn.commit()
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail=(
                    "This activation link has expired. "
                    "Please sign up again to receive a new link."
                ),
            )

        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE users
                SET email_verified = TRUE,
                    email_verification_token = NULL,
                    email_verification_expires_at = NULL,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (user["id"],),
            )
        conn.commit()

    return {"message": "Account activated successfully. You can now sign in."}


@router.post("/signin")
def signin(payload: SigninRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.tenant_id, u.email, u.password_hash, u.full_name, u.role,
                       u.branch_id, u.incentive, u.email_verified,
                       u.email_verification_expires_at, b.name AS branch_name
                FROM users u
                LEFT JOIN branches b ON u.branch_id = b.id
                WHERE u.email = LOWER(%s) AND u.is_active = TRUE
                ORDER BY u.created_at DESC
                LIMIT 1
                """,
                (payload.email,),
            )
            user = cur.fetchone()

            if not user or not verify_password(payload.password, user["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials",
                )

            # Block unverified accounts and clean up expired ones on-the-fly.
            if not user["email_verified"]:
                now = datetime.now(timezone.utc)
                expires_at = user["email_verification_expires_at"]
                if expires_at and now > expires_at:
                    # Activation window has passed — remove the record.
                    cur.execute("DELETE FROM users WHERE id = %s", (user["id"],))
                    conn.commit()
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=(
                            "Your activation link has expired. "
                            "Please sign up again to receive a new activation email."
                        ),
                    )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=(
                        "Account not activated. "
                        "Please check your email for the activation link."
                    ),
                )

            cur.execute(
                "UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = %s",
                (user["id"],),
            )
        conn.commit()

    access_token = create_access_token(
        user_id=str(user["id"]),
        email=user["email"],
        tenant_id=str(user["tenant_id"]),
    )

    from app.services.subscription_service import get_subscription
    sub = get_subscription(str(user["tenant_id"]))
    subscription_expired = bool(sub and sub["status"] == "expired")

    return {
        "user": {
            "id": str(user["id"]),
            "tenant_id": str(user["tenant_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "branch_id": user["branch_id"],
            "branch_name": user["branch_name"],
            "incentive": user["incentive"],
        },
        "access_token": access_token,
        "subscription_expired": subscription_expired,
    }


@router.get("/me")
def me(authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    token = _get_bearer_token(authorization)

    if is_token_revoked(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    try:
        claims = decode_token(token)
    except Exception as ex:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from ex

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.tenant_id, u.email, u.full_name, u.role, u.created_at,
                       u.branch_id, u.incentive, b.name AS branch_name
                FROM users u
                LEFT JOIN branches b ON u.branch_id = b.id
                WHERE u.id = %s AND u.is_active = TRUE
                LIMIT 1
                """,
                (user_id,),
            )
            user = cur.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "user": {
            "id": str(user["id"]),
            "tenant_id": str(user["tenant_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "branch_id": user["branch_id"],
            "branch_name": user["branch_name"],
            "incentive": user["incentive"],
            "created_at": user["created_at"],
        }
    }


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, str]:
    token = _get_bearer_token(authorization)

    if is_token_revoked(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    try:
        claims = decode_token(token)
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from ex

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT password_hash FROM users WHERE id = %s AND is_active = TRUE",
                (user_id,),
            )
            user = cur.fetchone()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found",
                )
            if not verify_password(payload.current_password, user["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is incorrect",
                )
            new_hash = hash_password(payload.new_password)
            cur.execute(
                "UPDATE users SET password_hash = %s, updated_at = NOW() WHERE id = %s",
                (new_hash, user_id),
            )
        conn.commit()

    return {"message": "Password changed successfully"}


@router.post("/verify-email")
def verify_email(token: str) -> dict[str, str]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, email_verified, email_verification_expires_at
                FROM users
                WHERE email_verification_token = %s AND is_active = TRUE
                LIMIT 1
                """,
                (token,),
            )
            user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )

        if user["email_verified"]:
            return {"message": "Email already verified"}

        if datetime.now(tz=timezone.utc) > user["email_verification_expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification token has expired. Please request a new one.",
            )

        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE users
                SET email_verified = TRUE,
                    email_verification_token = NULL,
                    email_verification_expires_at = NULL,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (user["id"],),
            )
        conn.commit()

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(payload: SigninRequest) -> dict[str, str]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, email, full_name, password_hash, email_verified
                FROM users
                WHERE email = LOWER(%s) AND is_active = TRUE
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (payload.email,),
            )
            user = cur.fetchone()

        if not user or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if user["email_verified"]:
            return {"message": "Email is already verified"}

        new_token = secrets.token_urlsafe(32)
        new_expires_at = datetime.now(tz=timezone.utc) + timedelta(hours=24)

        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE users
                SET email_verification_token = %s,
                    email_verification_expires_at = %s,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (new_token, new_expires_at, user["id"]),
            )
        conn.commit()

    from app.services.notification_service import send_email_verification
    send_email_verification(user["email"], user["full_name"] or "", new_token)

    return {"message": "Verification email resent. Please check your inbox."}


@router.post("/logout")
def logout(authorization: Optional[str] = Header(default=None)) -> dict[str, str]:
    token = _get_bearer_token(authorization)

    try:
        claims = decode_token(token)
    except Exception as ex:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from ex

    exp = int(claims.get("exp", 0))

    if not is_token_revoked(token):
        revoke_token(token, exp)

    return {"message": "Logged out successfully"}
