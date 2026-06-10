import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from langgraph.checkpoint.memory import MemorySaver

from app.flows.registry import GraphRegistry
from app.agent.tools.run_python import run_python
from app.api.routes import chat, sessions
from app.audit.store import MemoryAuditStore
from app.rag.bindings_store import MemoryRagflowBindingsStore
from app.sessions.store import MemorySessionStore


@pytest.fixture
def audit_app():
    app = FastAPI()
    registry = GraphRegistry.load_all(checkpointer=MemorySaver())
    app.state.graph_registry = registry
    app.state.graph = registry.get("default")
    app.state.session_store = MemorySessionStore()
    app.state.audit_store = MemoryAuditStore()
    app.state.ragflow_bindings_store = MemoryRagflowBindingsStore()
    app.include_router(sessions.router)
    app.include_router(chat.router)
    return app


@pytest.fixture
def audit_client(audit_app):
    with TestClient(audit_app) as client:
        yield client


@pytest.mark.asyncio
async def test_memory_audit_store_records_entry():
    store = MemoryAuditStore()
    entry = await store.log(
        action="create",
        resource_type="session",
        tenant_id="tenant-1",
        resource_id="sess-1",
        details={"title": "Test"},
    )
    assert entry.action == "create"
    assert entry.resource_type == "session"
    assert entry.tenant_id == "tenant-1"
    assert entry.resource_id == "sess-1"
    assert entry.details["title"] == "Test"

    entries = await store.list(tenant_id="tenant-1")
    assert len(entries) == 1
    assert entries[0].id == entry.id


@pytest.mark.asyncio
async def test_memory_audit_store_filters_by_tenant():
    store = MemoryAuditStore()
    await store.log(action="create", resource_type="session", tenant_id="a")
    await store.log(action="create", resource_type="session", tenant_id="b")

    assert len(await store.list(tenant_id="a")) == 1
    assert len(await store.list(tenant_id="b")) == 1
    assert len(await store.list()) == 2


@pytest.mark.asyncio
async def test_session_create_writes_audit(audit_client):
    resp = audit_client.post(
        "/v1/sessions",
        json={"title": "Audited"},
        headers={"X-Tenant-ID": "audit-tenant"},
    )
    assert resp.status_code == 200
    session_id = resp.json()["id"]

    store: MemoryAuditStore = audit_client.app.state.audit_store
    entries = await store.list(tenant_id="audit-tenant")
    assert len(entries) == 1
    assert entries[0].action == "create"
    assert entries[0].resource_type == "session"
    assert entries[0].resource_id == session_id


@pytest.mark.asyncio
async def test_session_delete_writes_audit(audit_client):
    create = audit_client.post("/v1/sessions", json={"title": "To delete"})
    session_id = create.json()["id"]

    resp = audit_client.delete(f"/v1/sessions/{session_id}")
    assert resp.status_code == 204

    store: MemoryAuditStore = audit_client.app.state.audit_store
    deletes = [e for e in await store.list() if e.action == "delete"]
    assert len(deletes) == 1
    assert deletes[0].resource_id == session_id


def test_run_python_blocks_socket_import():
    result = run_python("import socket\nsocket.socket()")
    assert result["exit_code"] != 0
    assert result.get("error")
    assert "unsafe" in result["error"].lower() or "network" in result["error"].lower()


def test_run_python_blocks_requests_import():
    result = run_python("import requests\nrequests.get('http://example.com')")
    assert result["exit_code"] != 0
    assert result.get("error")


def test_run_python_blocks_urllib_import():
    result = run_python("import urllib.request\nurllib.request.urlopen('http://x')")
    assert result["exit_code"] != 0
    assert result.get("error")


def test_run_python_allows_safe_code():
    result = run_python('print("safe")')
    assert result["exit_code"] == 0
    assert "safe" in result["stdout"]
