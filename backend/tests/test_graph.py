from unittest.mock import AsyncMock, MagicMock

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graph import build_graph
from app.rag.store import ChunkHit


class FakeLLM:
    def invoke(self, messages):
        return AIMessage(content="ok")


async def test_graph_invoke(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: FakeLLM())
    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t1"}}
    result = await graph.ainvoke(
        {"messages": [HumanMessage(content="use tdd")]}, config
    )
    types = [type(m) for m in result["messages"]]
    assert SystemMessage in types
    assert AIMessage in types
    assert len(result["messages"]) >= 3


async def test_graph_invoke_with_document_ids(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: FakeLLM())

    hits = [
        ChunkHit(chunk_id="c1", document_id="d1", content="rag context", score=0.9),
    ]
    mock_store = MagicMock()
    mock_store.similarity_search = AsyncMock(return_value=hits)
    monkeypatch.setattr(
        "app.agent.nodes.rag.get_document_store", lambda: mock_store
    )

    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t1"}}
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content="use tdd")],
            "document_ids": ["d1"],
        },
        config,
    )

    assert result.get("citations") == ["c1"]
    contents = [m.content for m in result["messages"] if isinstance(m, SystemMessage)]
    assert any("<context>" in content for content in contents)
