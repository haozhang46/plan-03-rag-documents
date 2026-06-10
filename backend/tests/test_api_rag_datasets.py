import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from app.rag.ragflow_client import RagFlowDataset


def test_list_rag_datasets_for_tenant(client, monkeypatch, test_app):
    monkeypatch.setenv("TENANT_MODE", "true")
    from app.config import get_settings
    from app.rag.bindings_store import MemoryRagflowBindingsStore

    get_settings.cache_clear()
    store = MemoryRagflowBindingsStore()
    asyncio.run(store.upsert("tenant-a", None, "rk-test12", []))
    test_app.state.ragflow_bindings_store = store

    mock_client = MagicMock()
    mock_client.list_datasets.return_value = [
        RagFlowDataset("ds-1", "Wiki", "team")
    ]

    with patch(
        "app.api.routes.rag.resolve_ragflow_client",
        new=AsyncMock(return_value=mock_client),
    ):
        resp = client.get(
            "/v1/rag/datasets",
            headers={"X-Tenant-ID": "tenant-a"},
        )
    assert resp.status_code == 200
    assert resp.json()["datasets"][0]["id"] == "ds-1"
    get_settings.cache_clear()
