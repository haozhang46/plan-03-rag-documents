from pathlib import Path

import asyncpg

from app.config import get_settings

_MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"


def _migration_sql(name: str) -> str:
    path = _MIGRATIONS_DIR / name
    return path.read_text()


def _sessions_sql() -> str:
    return """
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    starred BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
"""


async def create_tables() -> None:
    settings = get_settings()
    conn = await asyncpg.connect(settings.database_url)
    try:
        await conn.execute(_sessions_sql())
        if settings.tenant_mode:
            await conn.execute(_migration_sql("002_tenant.sql"))
        await conn.execute(_migration_sql("003_audit.sql"))
        await conn.execute(_migration_sql("004_ragflow_bindings.sql"))
        if settings.tenant_mode:
            await conn.execute(_migration_sql("005_users.sql"))
    finally:
        await conn.close()
