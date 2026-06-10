from langchain_core.messages import HumanMessage

from app.agent.nodes.rag import retrieve_rag_context
from app.config import get_settings


def test_ragflow_retrieve_uses_dataset_ids(monkeypatch):
    monkeypatch.setenv("RAG_BACKEND", "ragflow")
    get_settings.cache_clear()

    class _FakeChunk:
        chunk_id = "c1"
        document_id = "d1"
        content = "hello from ragflow"
        score = 0.9
        document_name = "a.md"

    with monkeypatch.context() as m:
        m.setattr(
            "app.agent.nodes.rag.RagFlowClient.retrieve",
            lambda self, **kwargs: [_FakeChunk()],
        )
        result = retrieve_rag_context(
            {
                "messages": [HumanMessage(content="find hello")],
                "dataset_ids": ["kb-1"],
            },
            {"configurable": {}},
        )

    assert "hello from ragflow" in result["messages"][0].content
    assert result["citations"] == ["c1"]
    get_settings.cache_clear()


def test_ragflow_skips_without_dataset_ids(monkeypatch):
    monkeypatch.setenv("RAG_BACKEND", "ragflow")
    get_settings.cache_clear()

    result = retrieve_rag_context(
        {"messages": [HumanMessage(content="hi")]},
        {"configurable": {}},
    )
    assert result == {}
    get_settings.cache_clear()
