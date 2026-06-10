import pytest
from fastapi import Depends, FastAPI, Request
from fastapi.testclient import TestClient
from starlette.responses import JSONResponse

from app.auth.tenant import get_tenant_id, require_tenant
from app.config import get_settings


def test_get_tenant_id_from_header():
    scope = {
        "type": "http",
        "headers": [(b"x-tenant-id", b"tenant-abc")],
        "method": "GET",
        "path": "/",
    }

    async def app(scope, receive, send):
        request = Request(scope, receive)
        tenant = get_tenant_id(request)
        response = JSONResponse({"tenant_id": tenant})
        await response(scope, receive, send)

    client = TestClient(app)
    resp = client.get("/", headers={"X-Tenant-ID": "tenant-abc"})
    assert resp.json()["tenant_id"] == "tenant-abc"


def test_get_tenant_id_returns_none_without_header():
    scope = {
        "type": "http",
        "headers": [],
        "method": "GET",
        "path": "/",
    }

    async def app(scope, receive, send):
        request = Request(scope, receive)
        tenant = get_tenant_id(request)
        response = JSONResponse({"tenant_id": tenant})
        await response(scope, receive, send)

    client = TestClient(app)
    resp = client.get("/")
    assert resp.json()["tenant_id"] is None


@pytest.fixture
def tenant_dep_app(monkeypatch):
    monkeypatch.setenv("TENANT_MODE", "true")
    get_settings.cache_clear()

    app = FastAPI()

    @app.get("/protected")
    async def protected(tenant_id: str = Depends(require_tenant)):
        return {"tenant_id": tenant_id}

    yield app
    get_settings.cache_clear()


def test_require_tenant_dependency_rejects_missing(tenant_dep_app):
    client = TestClient(tenant_dep_app)
    resp = client.get("/protected")
    assert resp.status_code == 401


def test_require_tenant_dependency_accepts_header(tenant_dep_app):
    client = TestClient(tenant_dep_app)
    resp = client.get("/protected", headers={"X-Tenant-ID": "tenant-x"})
    assert resp.status_code == 200
    assert resp.json()["tenant_id"] == "tenant-x"
