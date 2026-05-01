from contextlib import contextmanager
from typing import Iterator

from psycopg import Connection
from psycopg.rows import dict_row

from app.config import settings


@contextmanager
def get_connection() -> Iterator[Connection]:
    with Connection.connect(settings.database_url, row_factory=dict_row) as conn:
        yield conn
