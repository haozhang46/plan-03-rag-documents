from unittest.mock import AsyncMock, MagicMock

from langgraph.checkpoint.memory import MemorySaver

from app.flows.registry import GraphRegistry


def test_chat_unknown_flow_id_returns_400(client):
    client.app.state.graph_registry = GraphRegistry.load_all(
        checkpointer=MemorySaver()
    )
    resp = client.post(
        "/v1/chat",
        json={
            "flow_id": "not-a-real-flow",
            "thread_id": "t1",
            "message": "hi",
        },
    )
    assert resp.status_code == 400
    assert "unknown flow_id" in resp.json()["detail"]


def test_chat_unknown_skill_names_returns_400(client):
    client.app.state.graph_registry = GraphRegistry.load_all(
        checkpointer=MemorySaver()
    )
    resp = client.post(
        "/v1/chat",
        json={
            "flow_id": "default",
            "thread_id": "t1",
            "message": "hi",
            "skill_names": ["nonexistent-skill-xyz"],
        },
    )
    assert resp.status_code == 400
    assert "unknown skill_names" in resp.json()["detail"]
