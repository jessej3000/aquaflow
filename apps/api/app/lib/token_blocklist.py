from threading import Lock
from time import time

_revoked_tokens: dict[str, int] = {}
_lock = Lock()


def revoke_token(token: str, exp: int) -> None:
    with _lock:
        _revoked_tokens[token] = exp


def is_token_revoked(token: str) -> bool:
    now = int(time())

    with _lock:
        expired = [t for t, exp in _revoked_tokens.items() if exp <= now]
        for revoked_token in expired:
            _revoked_tokens.pop(revoked_token, None)

        return token in _revoked_tokens
