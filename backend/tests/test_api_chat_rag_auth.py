import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from app.rag.ragflow_client import RagFlowDataset


def test_chat_rejects_forbidden_dataset(client, monkeypatch, test_app):
    monkeypatch.setenv("TENANT_MODE", "true")
    from app.config import get_settings
    from app.rag.bindings_store import MemoryRagflowBindingsStore

    get_settings.cache_clear()
    store = MemoryRagflowBindingsStore()
    asyncio.run(store.upsert("tenant-a", None, "rk-test12", ["ds-allowed"]))
    test_app.state.ragflow_bindings_store = store

    mock_client = MagicMock()
    mock_client.list_datasets.return_value = [
        RagFlowDataset("ds-allowed", "OK", "team")
    ]

    with patch(
        "app.rag.authorize.resolve_ragflow_client",
        new=AsyncMock(return_value=mock_client),
    ):
        resp = client.post(
            "/v1/chat",
            json={
                "flow_id": "rag-flow",
                "thread_id": "t1",
                "message": "hi",
                "dataset_ids": ["ds-forbidden"],
            },
            headers={"X-Tenant-ID": "tenant-a"},
        )
    assert resp.status_code == 403
    get_settings.cache_clear()
