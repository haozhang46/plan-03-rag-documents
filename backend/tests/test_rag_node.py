from dataclasses import dataclass

import pytest
from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.nodes.rag import rag_node


@dataclass
class _FakeHit:
    chunk_id: str
    document_id: str
    content: str
    score: float


class _FakeStore:
    def __init__(self, hits=None):
        self._hits = hits or []

    async def similarity_search(self, query, document_ids=None, k=5):
        return self._hits


def test_rag_node_noop_when_no_document_ids():
    state = {"messages": [HumanMessage(content="hello")]}
    result = rag_node(state, {"configurable": {}})
    assert result == {}


def test_rag_node_noop_when_store_missing():
    state = {
        "messages": [HumanMessage(content="hello")],
        "document_ids": ["d1"],
    }
    result = rag_node(state, {"configurable": {}})
    assert result == {}


def test_rag_node_injects_context_and_citations():
    store = _FakeStore(
        hits=[
            _FakeHit(chunk_id="c1", document_id="d1", content="ctx A", score=0.9),
            _FakeHit(chunk_id="c2", document_id="d1", content="ctx B", score=0.8),
        ]
    )
    state = {
        "messages": [HumanMessage(content="query")],
        "document_ids": ["d1"],
    }
    config = {"configurable": {"store": store}}
    result = rag_node(state, config)

    assert "citations" in result
    assert result["citations"] == ["c1", "c2"]
    msgs = result["messages"]
    assert len(msgs) == 1
    assert isinstance(msgs[0], SystemMessage)
    assert "ctx A" in msgs[0].content
    assert "ctx B" in msgs[0].content
    assert "<context>" in msgs[0].content


def test_rag_node_uses_query_embedding(monkeypatch):
    from app.rag.store import ChunkHit

    vec = [0.2] * 768

    class _Store:
        async def similarity_search_by_vector(self, query_vec, document_ids=None, top_k=5):
            assert query_vec == vec
            return [
                ChunkHit("c1", "d1", "synced chunk", 0.9),
            ]

        async def similarity_search(self, *a, **k):
            raise AssertionError("should not embed on server")

    state = {
        "messages": [HumanMessage(content="summarize")],
        "document_ids": ["d1"],
        "query_embedding": vec,
    }
    config = {"configurable": {"store": _Store()}}
    out = rag_node(state, config)
    assert "<context>" in out["messages"][0].content
    assert "synced chunk" in out["messages"][0].content
