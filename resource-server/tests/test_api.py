import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch):
    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "test.db"
        monkeypatch.setattr(settings, "db_path", str(db_path))
        monkeypatch.setattr(settings, "auth_token", None)
        yield TestClient(app)


def test_resources_config_empty(client: TestClient):
    response = client.get("/v1/resources/config?project=demo")
    assert response.status_code == 200
    assert response.json() == {"instances": {}}


def test_topology_put_and_get(client: TestClient):
    body = {
        "version": 1,
        "project": "demo",
        "nodes": [{"id": "api", "kind": "service", "ports": [{"container": 8000, "host": 8000}]}],
        "edges": [],
        "targets": [{"id": "dev", "type": "docker-compose", "env": "dev"}],
    }
    put = client.put("/v1/topology?project=demo", json=body)
    assert put.status_code == 200
    get = client.get("/v1/topology?project=demo")
    assert get.status_code == 200
    assert get.json()["nodes"][0]["id"] == "api"


def test_topology_import_compose(client: TestClient):
    compose = Path("tests/fixtures/sample-compose.yml").read_text(encoding="utf-8")
    response = client.post(
        "/v1/topology/import?project=demo",
        json={"format": "compose", "content": compose},
    )
    assert response.status_code == 200
    data = response.json()
    assert {node["id"] for node in data["nodes"]} == {"api", "app-db", "cache"}


def test_topology_markdown(client: TestClient):
    body = {
        "version": 1,
        "project": "demo",
        "nodes": [
            {"id": "api", "kind": "service"},
            {"id": "app-db", "kind": "database", "engine": "mysql"},
        ],
        "edges": [{"from": "api", "to": "app-db", "env": {}}],
        "targets": [],
    }
    client.put("/v1/topology?project=demo", json=body)
    response = client.get("/v1/topology/markdown?project=demo")
    assert response.status_code == 200
    assert "## Service Topology" in response.json()["markdown"]
    assert "app-db (mysql)" in response.json()["markdown"]


def test_deployment_summary(client: TestClient):
    body = {
        "version": 1,
        "project": "demo",
        "nodes": [{"id": "api", "kind": "service", "image": "myapp:latest", "ports": []}],
        "edges": [],
        "targets": [{"id": "dev", "type": "docker-compose", "env": "dev"}],
    }
    client.put("/v1/topology?project=demo", json=body)
    response = client.get("/v1/deployment/summary?project=demo")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "docker-compose"
    assert data["services"][0]["name"] == "api"
