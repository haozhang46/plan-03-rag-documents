import logging
from pathlib import Path

from psycopg import AsyncConnection
from psycopg_pool import AsyncConnectionPool

from app.config import get_settings

logger = logging.getLogger(__name__)

_MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"
_pool: AsyncConnectionPool | None = None


async def init_pool() -> AsyncConnectionPool:
    global _pool
    if _pool is None:
        _pool = AsyncConnectionPool(
            conninfo=get_settings().database_url,
            open=False,
        )
        await _pool.open()
    return _pool


def get_pool() -> AsyncConnectionPool:
    if _pool is None:
        raise RuntimeError("Database pool not initialized. Call init_pool() first.")
    return _pool


def get_connection():
    """Return an async context manager yielding a pooled connection."""
    return get_pool().connection()


async def _tables_exist(conn: AsyncConnection) -> bool:
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'documents'
            )
            """
        )
        row = await cur.fetchone()
        return bool(row[0])


async def run_migrations() -> None:
    pool = await init_pool()
    async with pool.connection() as conn:
        if await _tables_exist(conn):
            logger.debug("RAG tables already exist, skipping migrations")
            return

        sql_files = sorted(_MIGRATIONS_DIR.glob("*.sql"))
        if not sql_files:
            logger.warning("No migration files found in %s", _MIGRATIONS_DIR)
            return

        for path in sql_files:
            logger.info("Running migration: %s", path.name)
            sql = path.read_text(encoding="utf-8")
            await conn.execute(sql)

        await conn.commit()
        logger.info("RAG migrations completed")
