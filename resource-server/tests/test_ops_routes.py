from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_ops_config_empty():
    r = client.get("/v1/ops/config")
    assert r.status_code == 200
    data = r.json()
    assert data.get("portainerUrl") is None
    assert data.get("mesheryUrl") is None


def test_ops_summary_requires_project():
    r = client.get("/v1/ops/summary")
    assert r.status_code == 422 or r.status_code == 400


@patch("app.api.routes.ops.fetch_portainer_summary")
@patch("app.api.routes.ops.fetch_meshery_summary")
def test_ops_summary_merged(mock_meshery, mock_portainer):
    from app.models.ops import DockerOpsSummary, KubernetesOpsSummary

    mock_portainer.return_value = DockerOpsSummary(
        configured=True,
        reachable=True,
        stack_count=2,
    )
    mock_meshery.return_value = KubernetesOpsSummary(
        configured=True,
        reachable=True,
        version="0.7.0",
        connection_count=1,
    )

    r = client.get("/v1/ops/summary?project=ops-test-empty")
    assert r.status_code == 200
    data = r.json()
    assert data["docker"]["stackCount"] == 2
    assert data["kubernetes"]["version"] == "0.7.0"
    assert data["intentNodeCount"] is None
