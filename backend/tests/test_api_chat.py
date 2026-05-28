from langchain_core.messages import AIMessage

from app.agent.nodes.chat import chat_node


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_chat_sse_returns_message(client, monkeypatch):
    class FakeLLM:
        def invoke(self, messages):
            return AIMessage(content="hello from agent")

    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: FakeLLM())

    with client.stream(
        "POST",
        "/v1/chat",
        json={"thread_id": "demo", "message": "hi"},
    ) as response:
        assert response.status_code == 200
        body = "".join(response.iter_lines())
        assert "hello from agent" in body
