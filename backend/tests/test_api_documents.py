from io import BytesIO

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


def test_upload_returns_503_without_store(client):
    resp = client.post(
        "/v1/documents",
        files={"file": ("test.txt", BytesIO(b"hello world"), "text/plain")},
    )
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"]


def test_upload_returns_doc_id(doc_client):
    resp = doc_client.post(
        "/v1/documents",
        files={"file": ("demo.txt", BytesIO(b"hello " * 200), "text/plain")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "document_id" in data
    assert data["document_id"].startswith("mock-")
