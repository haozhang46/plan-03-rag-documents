import json
from unittest.mock import AsyncMock, MagicMock, patch

from langchain_core.language_models.fake_chat_models import GenericFakeChatModel


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_chat_sse_returns_message(client, monkeypatch):
    monkeypatch.setenv("TENANT_MODE", "false")
    from app.config import get_settings

    get_settings.cache_clear()
    fake = GenericFakeChatModel(
        messages=iter(["hello from agent"]),
    )
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: fake)

    with client.stream(
        "POST",
        "/v1/chat",
        json={"thread_id": "demo", "message": "hi"},
    ) as response:
        assert response.status_code == 200
        tokens = []
        for line in response.iter_lines():
            if line.startswith("data: "):
                chunk = json.loads(line[6:])
                if "content" in chunk:
                    tokens.append(chunk["content"])
        full = "".join(tokens)
        assert "hello from agent" in full
    get_settings.cache_clear()


def test_authorize_applies_env_defaults_for_rag_flow(monkeypatch, test_app):
    import asyncio
    from unittest.mock import AsyncMock, patch

    from starlette.requests import Request

    from app.auth.identity import RequestIdentity
    from app.config import get_settings
    from app.rag.authorize import authorize_rag_datasets
    from app.rag.ragflow_client import RagFlowDataset

    monkeypatch.setenv("RAGFLOW_DEFAULT_DATASET_IDS", "ds-1,ds-2")
    get_settings.cache_clear()
    scope = {"type": "http", "headers": [], "method": "GET", "path": "/"}
    request = Request(scope)
    mock_client = MagicMock()
    mock_client.list_datasets.return_value = [
        RagFlowDataset("ds-1", "A", "team"),
        RagFlowDataset("ds-2", "B", "team"),
    ]
    with patch(
        "app.rag.authorize.resolve_ragflow_client",
        new=AsyncMock(return_value=mock_client),
    ):
        resolved, _ = asyncio.run(
            authorize_rag_datasets(
                request,
                flow_id="rag-flow",
                dataset_ids=None,
                identity=RequestIdentity(None, None),
                store=test_app.state.ragflow_bindings_store,
            )
        )
    assert resolved == ["ds-1", "ds-2"]
    get_settings.cache_clear()
