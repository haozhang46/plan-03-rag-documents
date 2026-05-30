from dataclasses import dataclass

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graphs.rag_agent import build_rag_agent, rag_agent_node


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


def test_rag_agent_subgraph_injects_context_and_citations():
    store = _FakeStore(
        hits=[
            _FakeHit(chunk_id="c1", document_id="d1", content="chunk one", score=0.9),
        ]
    )
    state = {
        "messages": [HumanMessage(content="what does the doc say?")],
        "document_ids": ["d1"],
    }
    config = {"configurable": {"store": store}}
    graph = build_rag_agent()
    result = graph.invoke(state, config)

    assert result["citations"] == ["c1"]
    assert any(
        isinstance(m, SystemMessage) and "chunk one" in m.content
        for m in result["messages"]
    )


def test_rag_agent_subgraph_noop_without_document_ids():
    store = _FakeStore(hits=[_FakeHit("c1", "d1", "x", 0.9)])
    state = {"messages": [HumanMessage(content="hello")]}
    config = {"configurable": {"store": store}}
    graph = build_rag_agent()
    result = graph.invoke(state, config)

    assert "citations" not in result or not result.get("citations")
    assert not any(
        isinstance(m, SystemMessage) and "<context>" in m.content
        for m in result.get("messages", [])
    )


def test_rag_agent_node_sets_rag_completed(monkeypatch):
    store = _FakeStore(
        hits=[_FakeHit(chunk_id="c1", document_id="d1", content="ctx", score=0.9)]
    )
    state = {
        "messages": [HumanMessage(content="query")],
        "document_ids": ["d1"],
    }
    config = {"configurable": {"store": store}}
    out = rag_agent_node(state, config)

    assert out.get("rag_completed") is True
    assert out.get("citations") == ["c1"]


def test_rag_agent_node_emits_langfuse_subgraph_span(monkeypatch):
    calls = []

    class _FakeClient:
        def start_as_current_observation(self, **kwargs):
            calls.append(kwargs)

            class _Ctx:
                def __enter__(self):
                    return self

                def __exit__(self, *args):
                    return False

                def update(self, **kwargs):
                    calls.append(kwargs)

            return _Ctx()

    monkeypatch.setattr(
        "app.agent.graphs.rag_agent.get_langfuse_client", lambda: _FakeClient()
    )
    state = {"messages": [HumanMessage(content="hi")]}
    rag_agent_node(state, {"configurable": {}})

    assert any(c.get("name") == "subgraph.invoke" for c in calls)
    assert any(c.get("metadata", {}).get("name") == "rag_agent" for c in calls)


async def test_supervisor_rag_path_returns_to_planner_then_chat(
    monkeypatch, skills_fixture
):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    monkeypatch.setenv("SUPERVISOR_MODE", "llm")
    from app.config import get_settings
    from app.agent.nodes import planner as planner_mod

    get_settings.cache_clear()

    planner_calls = {"n": 0}
    original_planner = planner_mod.planner_node

    def _counting_planner(state):
        planner_calls["n"] += 1
        return original_planner(state)

    monkeypatch.setattr(planner_mod, "planner_node", _counting_planner)
    monkeypatch.setattr("app.agent.graph.planner_node", _counting_planner)

    class _FakeStructured:
        def invoke(self, _messages):
            from app.agent.models.router import RouterOutput

            return RouterOutput(next_agent="rag", reasoning="needs docs")

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

        async def astream(self, _messages):
            from langchain_core.messages import AIMessage

            yield AIMessage(content="answer from chat")

    monkeypatch.setattr("app.agent.nodes.planner.get_chat_model", lambda: _FakeLLM())
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: _FakeLLM())

    subgraph_calls = {"n": 0}
    original = rag_agent_node

    def _counting_rag_agent(state, config):
        subgraph_calls["n"] += 1
        return original(state, config)

    monkeypatch.setattr(
        "app.agent.graph.rag_agent_node", _counting_rag_agent
    )

    store = _FakeStore(
        hits=[_FakeHit(chunk_id="c1", document_id="d1", content="doc text", score=0.9)]
    )
    from app.agent.graph import build_graph

    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t-rag-handoff", "store": store}}
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content="summarize the uploaded pdf")],
            "document_ids": ["d1"],
        },
        config,
    )

    assert subgraph_calls["n"] == 1
    assert planner_calls["n"] == 2
    assert result.get("citations") == ["c1"]
    assert result.get("rag_completed") is True
    assert any(
        isinstance(m, SystemMessage) and "doc text" in m.content
        for m in result["messages"]
    )
    get_settings.cache_clear()
