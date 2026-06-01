from io import BytesIO
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routes import documents
from app.rag.store import DocumentStore


class _MockDocStore:
    def __init__(self):
        self.docs = []
        self.chunks = []

    async def create_document(self, filename: str) -> str:
        doc_id = f"mock-{len(self.docs)}"
        self.docs.append((doc_id, filename))
        return doc_id

    async def add_chunks(self, doc_id, chunks):
        self.chunks.append((doc_id, chunks))


@pytest.fixture
def doc_client():
    app = FastAPI()
    app.state.store = _MockDocStore()
    app.include_router(documents.router)
    with TestClient(app) as c:
        yield c


@pytest.fixture
def client_with_store(client):
    store = MagicMock()
    store.create_document_meta = AsyncMock(return_value="doc-uuid-1")
    store.add_chunks_precomputed = AsyncMock(return_value=1)
    client.app.state.store = store
    return client, store


def test_upload_returns_503_without_store(client):
    resp = client.post(
        "/v1/documents/upload",
        files={"file": ("test.txt", BytesIO(b"hello world"), "text/plain")},
    )
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"]


def test_upload_returns_doc_id(doc_client):
    resp = doc_client.post(
        "/v1/documents/upload",
        files={"file": ("demo.txt", BytesIO(b"hello " * 200), "text/plain")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "document_id" in data
    assert data["document_id"].startswith("mock-")


def test_create_document_meta(client_with_store):
    client, store = client_with_store
    resp = client.post(
        "/v1/documents",
        json={
            "filename": "notes.md",
            "content_type": "text/markdown",
            "embedding_model": "nomic-embed-text",
            "embedding_dimensions": 768,
        },
    )
    assert resp.status_code == 200
    assert resp.json()["document_id"] == "doc-uuid-1"
    store.create_document_meta.assert_awaited_once_with(
        "notes.md",
        "text/markdown",
        "nomic-embed-text",
        768,
        tenant_id=None,
    )


def test_create_document_meta_returns_503_without_store(client):
    resp = client.post(
        "/v1/documents",
        json={
            "filename": "notes.md",
            "content_type": "text/markdown",
            "embedding_model": "nomic-embed-text",
            "embedding_dimensions": 768,
        },
    )
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"]


def test_upload_chunks_batch(client_with_store):
    client, store = client_with_store
    payload = {
        "chunks": [
            {
                "content": "hello world",
                "embedding": [0.01] * 768,
            }
        ]
    }
    resp = client.post("/v1/documents/doc-uuid-1/chunks", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"ok": True, "count": 1}
    store.add_chunks_precomputed.assert_awaited_once()


def test_upload_chunks_returns_503_without_store(client):
    resp = client.post(
        "/v1/documents/doc-uuid-1/chunks",
        json={"chunks": [{"content": "hi", "embedding": [0.01] * 768}]},
    )
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"]
