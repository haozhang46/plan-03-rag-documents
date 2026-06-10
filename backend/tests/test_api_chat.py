import json

from langchain_core.language_models.fake_chat_models import GenericFakeChatModel


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_chat_sse_returns_message(client, monkeypatch):
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


def test_build_input_fills_ragflow_default_dataset_ids(monkeypatch):
    monkeypatch.setenv("RAG_BACKEND", "ragflow")
    monkeypatch.setenv("RAGFLOW_DEFAULT_DATASET_IDS", "ds-1,ds-2")
    from app.api.routes.chat import ChatRequest, _build_input
    from app.config import get_settings

    get_settings.cache_clear()
    state = _build_input(ChatRequest(thread_id="t", message="hi"), None)
    get_settings.cache_clear()
    assert state["dataset_ids"] == ["ds-1", "ds-2"]
