import os

import pytest

from app.config import get_settings
from app.rag.store import (
    EMBEDDING_DIM,
    ChunkHit,
    DocumentStore,
    mock_embedding,
)


def test_chunk_hit_model():
    hit = ChunkHit(
        chunk_id="c1",
        document_id="d1",
        content="sample chunk text",
        score=0.87,
    )
    assert hit.chunk_id == "c1"
    assert hit.document_id == "d1"
    assert hit.content == "sample chunk text"
    assert hit.score == 0.87


def test_mock_embedding_dimensions():
    vec = mock_embedding("hello world")
    assert len(vec) == EMBEDDING_DIM
    assert all(isinstance(v, float) for v in vec)


def test_mock_embedding_deterministic():
    assert mock_embedding("same text") == mock_embedding("same text")
    assert mock_embedding("text a") != mock_embedding("text b")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_add_chunks_and_search(monkeypatch):
    if os.environ.get("RUN_INTEGRATION") != "1":
        pytest.skip("Set RUN_INTEGRATION=1 to run integration tests")

    monkeypatch.setenv("EMBEDDING_PROVIDER", "mock")
    get_settings.cache_clear()

    from app.rag.db import get_pool, init_pool, run_migrations

    try:
        await init_pool()
        async with get_pool().connection() as conn:
            await conn.execute("SELECT 1")
    except Exception:
        pytest.skip("PostgreSQL not available")

    await run_migrations()
    store = DocumentStore()

    doc_id = await store.create_document("fixture.txt")
    await store.add_chunks(
        doc_id,
        [
            "The quick brown fox jumps over the lazy dog.",
            "PostgreSQL pgvector enables similarity search.",
            "Unrelated content about cooking pasta.",
        ],
    )

    hits = await store.similarity_search("fox jumps", k=2)
    assert len(hits) == 2
    assert all(isinstance(h, ChunkHit) for h in hits)
    assert hits[0].score >= hits[1].score
    assert "fox" in hits[0].content.lower()

    filtered = await store.similarity_search(
        "postgres vector",
        document_ids=[doc_id],
        k=1,
    )
    assert len(filtered) == 1
    assert filtered[0].document_id == doc_id

    async with get_pool().connection() as conn:
        await conn.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
        await conn.commit()

    get_settings.cache_clear()
