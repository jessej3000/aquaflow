import asyncio
import json

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.lib.security import decode_token
from app.lib.token_blocklist import is_token_revoked

_EXEMPT_PATHS = frozenset({"/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico"})
_EXEMPT_PREFIXES = ("/auth/", "/subscription/", "/gql")


class SubscriptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        path = request.url.path

        if path in _EXEMPT_PATHS:
            return await call_next(request)

        for prefix in _EXEMPT_PREFIXES:
            if path.startswith(prefix):
                return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return await call_next(request)

        token = auth_header.removeprefix("Bearer ").strip()

        if is_token_revoked(token):
            return await call_next(request)

        try:
            claims = decode_token(token)
        except Exception:
            return await call_next(request)

        user_id = claims.get("sub")
        tenant_id = claims.get("tenant_id")

        if not user_id or not tenant_id:
            return await call_next(request)

        from app.services.subscription_service import check_access
        allowed, reason = await asyncio.to_thread(check_access, tenant_id, user_id)

        if not allowed:
            return Response(
                content=json.dumps({"detail": reason, "code": "subscription_expired"}),
                status_code=403,
                media_type="application/json",
            )

        return await call_next(request)
