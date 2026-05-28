import hashlib
import struct
from functools import lru_cache

from pydantic import BaseModel

from app.config import get_settings
from app.rag.db import get_connection

EMBEDDING_DIM = 1536


class ChunkHit(BaseModel):
    chunk_id: str
    document_id: str
    content: str
    score: float


def mock_embedding(text: str, dim: int = EMBEDDING_DIM) -> list[float]:
    """Deterministic pseudo-embedding for tests without API keys."""
    seed = hashlib.sha256(text.encode()).digest()
    vec: list[float] = []
    while len(vec) < dim:
        for i in range(0, len(seed) - 3, 4):
            val = struct.unpack(">i", seed[i : i + 4])[0]
            vec.append((val % 10000) / 10000.0 - 0.5)
            if len(vec) >= dim:
                break
        seed = hashlib.sha256(seed).digest()
    norm = sum(x * x for x in vec) ** 0.5
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec


def format_vector(vec: list[float]) -> str:
    return "[" + ",".join(f"{v:.8f}" for v in vec) + "]"


@lru_cache
def _openai_embedder():
    from langchain_openai import OpenAIEmbeddings

    settings = get_settings()
    return OpenAIEmbeddings(
        model=settings.embedding_model,
        api_key=settings.openai_api_key,
    )


async def embed_texts(texts: list[str]) -> list[list[float]]:
    settings = get_settings()
    if settings.embedding_provider == "mock":
        return [mock_embedding(t) for t in texts]
    if settings.embedding_provider == "openai":
        return await _openai_embedder().aembed_documents(texts)
    raise ValueError(f"Unknown embedding provider: {settings.embedding_provider}")


class DocumentStore:
    async def create_document(self, filename: str) -> str:
        async with get_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "INSERT INTO documents (filename) VALUES (%s) RETURNING id",
                    (filename,),
                )
                row = await cur.fetchone()
            await conn.commit()
        return str(row[0])

    async def add_chunks(self, document_id: str, chunks: list[str]) -> None:
        if not chunks:
            return
        embeddings = await embed_texts(chunks)
        async with get_connection() as conn:
            async with conn.cursor() as cur:
                for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    await cur.execute(
                        """
                        INSERT INTO document_chunks
                            (document_id, chunk_index, content, embedding)
                        VALUES (%s, %s, %s, %s::vector)
                        """,
                        (document_id, idx, chunk, format_vector(embedding)),
                    )
            await conn.commit()

    async def similarity_search(
        self,
        query: str,
        document_ids: list[str] | None = None,
        k: int = 5,
    ) -> list[ChunkHit]:
        query_vec = format_vector((await embed_texts([query]))[0])

        if document_ids:
            sql = """
                SELECT id, document_id, content,
                       (embedding <=> %s::vector) AS distance
                FROM document_chunks
                WHERE document_id = ANY(%s::uuid[])
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            """
            params: tuple = (query_vec, document_ids, query_vec, k)
        else:
            sql = """
                SELECT id, document_id, content,
                       (embedding <=> %s::vector) AS distance
                FROM document_chunks
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            """
            params = (query_vec, query_vec, k)

        async with get_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(sql, params)
                rows = await cur.fetchall()

        return [
            ChunkHit(
                chunk_id=str(row[0]),
                document_id=str(row[1]),
                content=row[2],
                score=1.0 - float(row[3]),
            )
            for row in rows
        ]
