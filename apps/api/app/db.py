from contextlib import contextmanager
from typing import Iterator

from psycopg import Connection
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.config import settings

_pool: ConnectionPool | None = None


def init_pool() -> None:
    global _pool
    _pool = ConnectionPool(
        settings.database_url,
        min_size=2,
        max_size=10,
        kwargs={"row_factory": dict_row},
        open=True,
    )


def close_pool() -> None:
    global _pool
    if _pool:
        _pool.close()
        _pool = None


@contextmanager
def get_connection() -> Iterator[Connection]:
    assert _pool is not None, "Database pool is not initialized"
    with _pool.connection() as conn:
        yield conn
