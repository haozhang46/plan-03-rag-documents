import pytest

from app.rag.store import ChunkHit, DocumentStore


class _FakeEmbeddings:
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[0.1] * 768 for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [0.1] * 768


@pytest.fixture
def store():
    return DocumentStore(embeddings=_FakeEmbeddings())


def test_chunk_hit_fields():
    hit = ChunkHit(
        chunk_id="c1",
        document_id="d1",
        content="hello",
        score=0.95,
    )
    assert hit.chunk_id == "c1"
    assert hit.content == "hello"


@pytest.mark.asyncio
async def test_create_document_requires_db(store):
    """Integration guard: store hits real DB — skip when no Postgres."""
    import asyncpg

    try:
        doc_id = await store.create_document("test.txt")
    except (asyncpg.exceptions.PostgresError, OSError, ConnectionError):
        pytest.skip("Postgres not available")
    assert doc_id


@pytest.mark.asyncio
async def test_add_chunks_and_search_requires_db(store):
    import asyncpg

    try:
        doc_id = await store.create_document("demo.txt")
        await store.add_chunks(doc_id, ["chunk one", "chunk two"])
        hits = await store.similarity_search("test", document_ids=[doc_id], k=2)
    except (asyncpg.exceptions.PostgresError, OSError, ConnectionError):
        pytest.skip("Postgres not available")
    assert len(hits) == 2
    assert hits[0].document_id == doc_id


@pytest.mark.asyncio
async def test_add_chunks_precomputed_validates_dim(store):
    with pytest.raises(ValueError, match="embedding dimension"):
        await store.add_chunks_precomputed(
            "00000000-0000-0000-0000-000000000001",
            [{"content": "hi", "embedding": [0.1] * 100}],
        )


@pytest.mark.asyncio
async def test_similarity_search_by_vector_validates_dim(store):
    with pytest.raises(ValueError, match="embedding dimension"):
        await store.similarity_search_by_vector(
            [0.1] * 100,
            document_ids=["00000000-0000-0000-0000-000000000001"],
            top_k=3,
        )


@pytest.mark.asyncio
async def test_create_document_meta_and_precomputed_chunks_requires_db(store):
    import asyncpg

    vec = [0.1] * 768
    chunks = [
        {"content": "chunk one", "embedding": vec},
        {"content": "chunk two", "embedding": vec},
    ]
    try:
        doc_id = await store.create_document_meta(
            "demo.txt",
            "text/plain",
            "nomic-embed-text",
            768,
        )
        n = await store.add_chunks_precomputed(doc_id, chunks)
        hits = await store.similarity_search_by_vector(
            vec, document_ids=[doc_id], top_k=2
        )
    except (asyncpg.exceptions.PostgresError, OSError, ConnectionError):
        pytest.skip("Postgres not available")
    assert n == 2
    assert len(hits) == 2
    assert hits[0]["document_id"] == doc_id
    assert "content" in hits[0]
    assert "score" in hits[0]
