import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routes import documents, sessions
from app.config import get_settings
from app.rag.store import MemoryDocumentStore
from app.sessions.store import MemorySessionStore


@pytest.fixture
def tenant_client(monkeypatch):
    monkeypatch.setenv("TENANT_MODE", "true")
    get_settings.cache_clear()

    app = FastAPI()
    app.state.store = MemoryDocumentStore()
    app.state.session_store = MemorySessionStore()
    app.include_router(documents.router)
    app.include_router(sessions.router)

    with TestClient(app) as client:
        yield client

    get_settings.cache_clear()


def test_missing_tenant_header_returns_401(tenant_client):
    resp = tenant_client.get("/v1/sessions")
    assert resp.status_code == 401


def test_tenant_a_cannot_read_tenant_b_sessions(tenant_client):
    resp_a = tenant_client.post(
        "/v1/sessions",
        json={"title": "A chat"},
        headers={"X-Tenant-ID": "tenant-a"},
    )
    assert resp_a.status_code == 200

    resp_b = tenant_client.get(
        "/v1/sessions",
        headers={"X-Tenant-ID": "tenant-b"},
    )
    assert resp_b.status_code == 200
    assert resp_b.json() == []


def test_tenant_a_cannot_access_tenant_b_documents(tenant_client):
    resp_a = tenant_client.post(
        "/v1/documents",
        json={
            "filename": "secret.txt",
            "content_type": "text/plain",
            "embedding_model": "nomic-embed-text",
            "embedding_dimensions": 768,
        },
        headers={"X-Tenant-ID": "tenant-a"},
    )
    assert resp_a.status_code == 200
    doc_id = resp_a.json()["document_id"]

    resp_b = tenant_client.post(
        f"/v1/documents/{doc_id}/chunks",
        json={"chunks": [{"content": "stolen", "embedding": [0.01] * 768}]},
        headers={"X-Tenant-ID": "tenant-b"},
    )
    assert resp_b.status_code == 404


def test_tenant_mode_off_does_not_require_header(client, monkeypatch):
    monkeypatch.setenv("TENANT_MODE", "false")
    get_settings.cache_clear()
    resp = client.get("/v1/sessions")
    assert resp.status_code == 200
    get_settings.cache_clear()
