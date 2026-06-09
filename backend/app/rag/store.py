from dataclasses import dataclass
from uuid import uuid4

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

    async def _connect(self, tenant_id: str | None = None):
        conn = await asyncpg.connect(self._dsn)
        if tenant_id and get_settings().tenant_mode:
            await conn.execute("SELECT set_config('app.tenant_id', $1, false)", tenant_id)
        return conn

    async def create_document(
        self, filename: str, tenant_id: str | None = None
    ) -> str:
        conn = await self._connect(tenant_id)
        try:
            if tenant_id and get_settings().tenant_mode:
                row = await conn.fetchrow(
                    "INSERT INTO documents (filename, tenant_id) "
                    "VALUES ($1, $2) RETURNING id",
                    filename,
                    tenant_id,
                )
            else:
                row = await conn.fetchrow(
                    "INSERT INTO documents (filename) VALUES ($1) RETURNING id",
                    filename,
                )
            return str(row["id"])
        finally:
            await conn.close()

    async def add_chunks(
        self, doc_id: str, chunks: list[str], tenant_id: str | None = None
    ) -> None:
        if tenant_id and not await self.document_exists(doc_id, tenant_id):
            raise LookupError("document not found")
        vectors = self._embeddings.embed_documents(chunks)
        conn = await self._connect(tenant_id)
        try:
            async with conn.transaction():
                for i, (chunk, vec) in enumerate(zip(chunks, vectors)):
                    if tenant_id and get_settings().tenant_mode:
                        await conn.execute(
                            "INSERT INTO document_chunks "
                            "(document_id, chunk_index, content, embedding, tenant_id) "
                            "VALUES ($1::uuid, $2, $3, $4, $5)",
                            doc_id,
                            i,
                            chunk,
                            vec,
                            tenant_id,
                        )
                    else:
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

    async def create_document_meta(
        self,
        filename: str,
        content_type: str,
        embedding_model: str,
        embedding_dimensions: int,
        tenant_id: str | None = None,
    ) -> str:
        conn = await self._connect(tenant_id)
        try:
            if tenant_id and get_settings().tenant_mode:
                row = await conn.fetchrow(
                    "INSERT INTO documents "
                    "(filename, content_type, embedding_model, "
                    "embedding_dimensions, tenant_id) "
                    "VALUES ($1, $2, $3, $4, $5) RETURNING id",
                    filename,
                    content_type,
                    embedding_model,
                    embedding_dimensions,
                    tenant_id,
                )
            else:
                row = await conn.fetchrow(
                    "INSERT INTO documents "
                    "(filename, content_type, embedding_model, embedding_dimensions) "
                    "VALUES ($1, $2, $3, $4) RETURNING id",
                    filename,
                    content_type,
                    embedding_model,
                    embedding_dimensions,
                )
            return str(row["id"])
        finally:
            await conn.close()

    async def list_documents(
        self, tenant_id: str | None = None
    ) -> list[dict]:
        conn = await self._connect(tenant_id)
        try:
            if tenant_id and get_settings().tenant_mode:
                rows = await conn.fetch(
                    "SELECT id, filename, content_type, embedding_model, "
                    "embedding_dimensions, created_at "
                    "FROM documents WHERE tenant_id = $1 "
                    "ORDER BY created_at DESC",
                    tenant_id,
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, filename, content_type, embedding_model, "
                    "embedding_dimensions, created_at "
                    "FROM documents ORDER BY created_at DESC"
                )
            return [
                {
                    "document_id": str(r["id"]),
                    "filename": r["filename"],
                    "content_type": r.get("content_type"),
                    "embedding_model": r.get("embedding_model"),
                    "embedding_dimensions": r.get("embedding_dimensions"),
                    "created_at": (
                        r["created_at"].isoformat() if r["created_at"] else None
                    ),
                }
                for r in rows
            ]
        finally:
            await conn.close()

    async def delete_document(
        self, doc_id: str, tenant_id: str | None = None
    ) -> bool:
        conn = await self._connect(tenant_id)
        try:
            if tenant_id and get_settings().tenant_mode:
                result = await conn.execute(
                    "DELETE FROM documents WHERE id = $1::uuid AND tenant_id = $2",
                    doc_id,
                    tenant_id,
                )
            else:
                result = await conn.execute(
                    "DELETE FROM documents WHERE id = $1::uuid",
                    doc_id,
                )
            return result != "DELETE 0"
        finally:
            await conn.close()

    async def document_exists(
        self, doc_id: str, tenant_id: str | None = None
    ) -> bool:
        conn = await self._connect(tenant_id)
        try:
            if tenant_id and get_settings().tenant_mode:
                row = await conn.fetchrow(
                    "SELECT id FROM documents WHERE id = $1::uuid AND tenant_id = $2",
                    doc_id,
                    tenant_id,
                )
            else:
                row = await conn.fetchrow(
                    "SELECT id FROM documents WHERE id = $1::uuid",
                    doc_id,
                )
            return row is not None
        finally:
            await conn.close()

    async def add_chunks_precomputed(
        self,
        doc_id: str,
        chunks: list[dict],
        tenant_id: str | None = None,
    ) -> int:
        if tenant_id and not await self.document_exists(doc_id, tenant_id):
            raise LookupError("document not found")
        expected = get_settings().expected_embedding_dimensions
        for row in chunks:
            emb = row["embedding"]
            if len(emb) != expected:
                raise ValueError(
                    f"embedding dimension {len(emb)} != expected {expected}"
                )
        conn = await self._connect(tenant_id)
        try:
            async with conn.transaction():
                for i, row in enumerate(chunks):
                    emb = row["embedding"]
                    chunk_index = row.get("chunk_index", i)
                    if tenant_id and get_settings().tenant_mode:
                        await conn.execute(
                            "INSERT INTO document_chunks "
                            "(document_id, chunk_index, content, embedding, tenant_id) "
                            "VALUES ($1::uuid, $2, $3, $4, $5)",
                            doc_id,
                            chunk_index,
                            row["content"],
                            emb,
                            tenant_id,
                        )
                    else:
                        await conn.execute(
                            "INSERT INTO document_chunks "
                            "(document_id, chunk_index, content, embedding) "
                            "VALUES ($1::uuid, $2, $3, $4)",
                            doc_id,
                            chunk_index,
                            row["content"],
                            emb,
                        )
            return len(chunks)
        finally:
            await conn.close()

    async def similarity_search_by_vector(
        self,
        query_embedding: list[float],
        document_ids: list[str] | None = None,
        top_k: int = 5,
        tenant_id: str | None = None,
    ) -> list[dict]:
        expected = get_settings().expected_embedding_dimensions
        if len(query_embedding) != expected:
            raise ValueError(
                f"query embedding dimension {len(query_embedding)} "
                f"!= expected {expected}"
            )
        conn = await self._connect(tenant_id)
        try:
            if document_ids:
                rows = await conn.fetch(
                    "SELECT id, document_id, content, "
                    "1 - (embedding <=> $1::vector) AS score "
                    "FROM document_chunks "
                    "WHERE document_id = ANY($2::uuid[]) "
                    "ORDER BY embedding <=> $1::vector "
                    "LIMIT $3",
                    query_embedding,
                    document_ids,
                    top_k,
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, document_id, content, "
                    "1 - (embedding <=> $1::vector) AS score "
                    "FROM document_chunks "
                    "ORDER BY embedding <=> $1::vector "
                    "LIMIT $2",
                    query_embedding,
                    top_k,
                )
            return [
                {
                    "chunk_id": str(r["id"]),
                    "document_id": str(r["document_id"]),
                    "content": r["content"],
                    "score": float(r["score"]),
                }
                for r in rows
            ]
        finally:
            await conn.close()

    async def similarity_search(
        self,
        query: str,
        document_ids: list[str] | None = None,
        k: int = 5,
        tenant_id: str | None = None,
    ) -> list[ChunkHit]:
        query_vec = self._embeddings.embed_query(query)
        conn = await self._connect(tenant_id)
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


class MemoryDocumentStore:
    def __init__(self) -> None:
        self._documents: dict[str, dict] = {}
        self._chunks: dict[str, list[dict]] = {}

    async def create_document_meta(
        self,
        filename: str,
        content_type: str,
        embedding_model: str,
        embedding_dimensions: int,
        tenant_id: str | None = None,
    ) -> str:
        doc_id = str(uuid4())
        self._documents[doc_id] = {
            "filename": filename,
            "content_type": content_type,
            "embedding_model": embedding_model,
            "embedding_dimensions": embedding_dimensions,
            "tenant_id": tenant_id or "default",
        }
        self._chunks[doc_id] = []
        return doc_id

    async def list_documents(
        self, tenant_id: str | None = None
    ) -> list[dict]:
        docs: list[dict] = []
        for doc_id, meta in self._documents.items():
            if tenant_id and get_settings().tenant_mode:
                if meta["tenant_id"] != tenant_id:
                    continue
            docs.append(
                {
                    "document_id": doc_id,
                    "filename": meta["filename"],
                    "content_type": meta.get("content_type"),
                    "embedding_model": meta.get("embedding_model"),
                    "embedding_dimensions": meta.get("embedding_dimensions"),
                    "created_at": meta.get("created_at"),
                }
            )
        return docs

    async def delete_document(
        self, doc_id: str, tenant_id: str | None = None
    ) -> bool:
        if not await self.document_exists(doc_id, tenant_id):
            return False
        del self._documents[doc_id]
        self._chunks.pop(doc_id, None)
        return True

    async def document_exists(
        self, doc_id: str, tenant_id: str | None = None
    ) -> bool:
        doc = self._documents.get(doc_id)
        if doc is None:
            return False
        if tenant_id and get_settings().tenant_mode:
            return doc["tenant_id"] == tenant_id
        return True

    async def add_chunks_precomputed(
        self,
        doc_id: str,
        chunks: list[dict],
        tenant_id: str | None = None,
    ) -> int:
        if not await self.document_exists(doc_id, tenant_id):
            raise LookupError("document not found")
        expected = get_settings().expected_embedding_dimensions
        for row in chunks:
            if len(row["embedding"]) != expected:
                raise ValueError(
                    f"embedding dimension {len(row['embedding'])} != expected {expected}"
                )
        stored = self._chunks.setdefault(doc_id, [])
        for i, row in enumerate(chunks):
            stored.append(
                {
                    "chunk_index": row.get("chunk_index", i),
                    "content": row["content"],
                    "embedding": row["embedding"],
                }
            )
        return len(chunks)

    async def similarity_search_by_vector(
        self,
        query_embedding: list[float],
        document_ids: list[str] | None = None,
        top_k: int = 5,
        tenant_id: str | None = None,
    ) -> list[dict]:
        hits: list[dict] = []
        for doc_id, chunks in self._chunks.items():
            doc = self._documents.get(doc_id)
            if doc is None:
                continue
            if tenant_id and get_settings().tenant_mode:
                if doc["tenant_id"] != tenant_id:
                    continue
            if document_ids and doc_id not in document_ids:
                continue
            for i, chunk in enumerate(chunks):
                hits.append(
                    {
                        "chunk_id": f"{doc_id}-{i}",
                        "document_id": doc_id,
                        "content": chunk["content"],
                        "score": 1.0,
                    }
                )
        return hits[:top_k]
