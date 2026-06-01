from pathlib import Path

import asyncpg

from app.config import get_settings

_MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"


def _tables_sql(dim: int) -> str:
    return f"""
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    content_type TEXT,
    embedding_model TEXT,
    embedding_dimensions INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector({dim}),
    metadata JSONB DEFAULT '{{}}'
);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding
    ON document_chunks USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    starred BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
"""


def _tenant_migration_sql() -> str:
    path = _MIGRATIONS_DIR / "002_tenant.sql"
    return path.read_text()


async def create_tables() -> None:
    settings = get_settings()
    conn = await asyncpg.connect(settings.database_url)
    try:
        await conn.execute(_tables_sql(settings.expected_embedding_dimensions))
        if settings.tenant_mode:
            await conn.execute(_tenant_migration_sql())
    finally:
        await conn.close()
