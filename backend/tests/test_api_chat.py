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
