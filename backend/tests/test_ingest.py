import os
from pathlib import Path
from unittest.mock import AsyncMock

import pytest

from app.config import get_settings
from app.rag.chunking import split_text
from app.rag.ingest import ingest_file

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "sample.txt"


def test_split_text_produces_multiple_chunks():
    text = FIXTURE_PATH.read_text(encoding="utf-8")
    chunks = split_text(text)
    assert len(chunks) > 1
    assert all(len(chunk) <= 800 for chunk in chunks)
    assert sum(len(c) for c in chunks) >= len(text) - 100 * (len(chunks) - 1)


@pytest.mark.asyncio
async def test_ingest_file_txt(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "mock")
    get_settings.cache_clear()

    if os.environ.get("RUN_INTEGRATION") == "1":
        from app.rag.db import get_pool, init_pool, run_migrations
        from app.rag.store import DocumentStore

        try:
            await init_pool()
            async with get_pool().connection() as conn:
                await conn.execute("SELECT 1")
        except Exception:
            pytest.skip("PostgreSQL not available")

        await run_migrations()
        store = DocumentStore()
        doc_id = await ingest_file(store, "sample.txt", FIXTURE_PATH)
        assert doc_id

        async with get_pool().connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT COUNT(*) FROM document_chunks WHERE document_id = %s",
                    (doc_id,),
                )
                row = await cur.fetchone()
            await conn.commit()
        assert row[0] > 0

        async with get_pool().connection() as conn:
            await conn.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
            await conn.commit()
    else:
        store = AsyncMock()
        store.create_document.return_value = "doc-123"
        doc_id = await ingest_file(store, "sample.txt", FIXTURE_PATH)
        assert doc_id == "doc-123"
        store.create_document.assert_awaited_once_with("sample.txt")
        store.add_chunks.assert_awaited_once()
        chunks = store.add_chunks.await_args.args[1]
        assert len(chunks) > 0

    get_settings.cache_clear()
