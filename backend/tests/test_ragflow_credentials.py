import pytest
from unittest.mock import MagicMock, patch

from app.auth.identity import RequestIdentity
from app.rag.bindings_store import MemoryRagflowBindingsStore
from app.rag.credentials import resolve_ragflow_client


@pytest.mark.asyncio
async def test_resolve_uses_user_binding_first(monkeypatch):
    monkeypatch.delenv("RAGFLOW_API_KEY", raising=False)
    store = MemoryRagflowBindingsStore()
    await store.upsert("t1", None, "tenant-key", [])
    await store.upsert("t1", "u1", "user-key", [])
    ident = RequestIdentity(tenant_id="t1", user_id="u1")
    client = await resolve_ragflow_client(ident, store)
    assert client._api_key == "user-key"


def test_list_datasets_parses_response():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "code": 0,
        "data": [{"id": "ds-1", "name": "Wiki", "permission": "me"}],
        "total_datasets": 1,
    }
    with patch("app.rag.ragflow_client.httpx.Client") as cls:
        http = MagicMock()
        http.__enter__ = MagicMock(return_value=http)
        http.__exit__ = MagicMock(return_value=False)
        http.get.return_value = mock_resp
        cls.return_value = http
        from app.rag.ragflow_client import RagFlowClient

        rows = RagFlowClient(api_key="k").list_datasets()
    assert rows[0].id == "ds-1"
    assert rows[0].name == "Wiki"
