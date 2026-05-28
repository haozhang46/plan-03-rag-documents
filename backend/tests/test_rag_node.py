from unittest.mock import AsyncMock, MagicMock

from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.nodes.rag import rag_node
from app.rag.store import ChunkHit


async def test_rag_node_injects_context_and_citations(monkeypatch):
    hits = [
        ChunkHit(chunk_id="c1", document_id="d1", content="chunk one", score=0.9),
        ChunkHit(chunk_id="c2", document_id="d1", content="chunk two", score=0.8),
    ]
    mock_store = MagicMock()
    mock_store.similarity_search = AsyncMock(return_value=hits)
    monkeypatch.setattr(
        "app.agent.nodes.rag.get_document_store", lambda: mock_store
    )

    state = {
        "messages": [HumanMessage(content="what is tdd?")],
        "document_ids": ["doc-1"],
    }
    out = await rag_node(state)

    assert "messages" in out
    sys_msg = out["messages"][0]
    assert isinstance(sys_msg, SystemMessage)
    assert "<context>" in sys_msg.content
    assert "[c1] chunk one" in sys_msg.content
    assert "[c2] chunk two" in sys_msg.content
    assert out["citations"] == ["c1", "c2"]
    mock_store.similarity_search.assert_awaited_once_with(
        "what is tdd?", document_ids=["doc-1"], k=5
    )


async def test_rag_node_empty_document_ids():
    state = {"messages": [HumanMessage(content="hi")]}
    assert await rag_node(state) == {}


async def test_rag_node_uses_last_human_message(monkeypatch):
    hits = [
        ChunkHit(chunk_id="c1", document_id="d1", content="found it", score=0.9),
    ]
    mock_store = MagicMock()
    mock_store.similarity_search = AsyncMock(return_value=hits)
    monkeypatch.setattr(
        "app.agent.nodes.rag.get_document_store", lambda: mock_store
    )

    state = {
        "messages": [
            HumanMessage(content="old question"),
            SystemMessage(content="<skills>ignored</skills>"),
            HumanMessage(content="latest question"),
        ],
        "document_ids": ["doc-1"],
    }
    await rag_node(state)

    mock_store.similarity_search.assert_awaited_once_with(
        "latest question", document_ids=["doc-1"], k=5
    )
