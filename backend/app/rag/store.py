from dataclasses import dataclass

import asyncpg
from langchain_openai import OpenAIEmbeddings

from app.config import get_settings


@dataclass
class ChunkHit:
    chunk_id: str
    document_id: str
    content: str
    score: float


class DocumentStore:
    def __init__(self, embeddings: OpenAIEmbeddings | None = None):
        self._embeddings = embeddings or OpenAIEmbeddings(
            api_key=get_settings().openai_api_key
        )

    @property
    def _dsn(self) -> str:
        return get_settings().database_url

    async def create_document(self, filename: str) -> str:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "INSERT INTO documents (filename) VALUES ($1) RETURNING id",
                filename,
            )
            return str(row["id"])
        finally:
            await conn.close()

    async def add_chunks(self, doc_id: str, chunks: list[str]) -> None:
        vectors = self._embeddings.embed_documents(chunks)
        conn = await asyncpg.connect(self._dsn)
        try:
            async with conn.transaction():
                for i, (chunk, vec) in enumerate(zip(chunks, vectors)):
                    await conn.execute(
                        "INSERT INTO document_chunks "
                        "(document_id, chunk_index, content, embedding) "
                        "VALUES ($1::uuid, $2, $3, $4)",
                        doc_id,
                        i,
                        chunk,
                        vec,
                    )
        finally:
            await conn.close()

    async def similarity_search(
        self,
        query: str,
        document_ids: list[str] | None = None,
        k: int = 5,
    ) -> list[ChunkHit]:
        query_vec = self._embeddings.embed_query(query)
        conn = await asyncpg.connect(self._dsn)
        try:
            if document_ids:
                rows = await conn.fetch(
                    "SELECT id, document_id, content, "
                    "1 - (embedding <=> $1::vector) AS score "
                    "FROM document_chunks "
                    "WHERE document_id = ANY($2::uuid[]) "
                    "ORDER BY embedding <=> $1::vector "
                    "LIMIT $3",
                    query_vec,
                    document_ids,
                    k,
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, document_id, content, "
                    "1 - (embedding <=> $1::vector) AS score "
                    "FROM document_chunks "
                    "ORDER BY embedding <=> $1::vector "
                    "LIMIT $2",
                    query_vec,
                    k,
                )
            return [
                ChunkHit(
                    chunk_id=str(r["id"]),
                    document_id=str(r["document_id"]),
                    content=r["content"],
                    score=float(r["score"]),
                )
                for r in rows
            ]
        finally:
            await conn.close()
