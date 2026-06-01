from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graphs.websearch_agent import build_websearch_agent, websearch_agent_node
from app.agent.nodes import planner as planner_mod


_MOCK_RESULTS = [
    {
        "title": "Latest News",
        "url": "https://example.com/news",
        "snippet": "Breaking story from today.",
    },
]


def test_websearch_subgraph_injects_results_and_sets_completed(monkeypatch):
    monkeypatch.setattr(
        "app.agent.graphs.websearch_agent.web_search",
        lambda query, max_results=None: _MOCK_RESULTS,
    )
    state = {"messages": [HumanMessage(content="latest news today")]}
    graph = build_websearch_agent()
    result = graph.invoke(state, {"configurable": {}})

    assert result.get("web_search_results") == _MOCK_RESULTS
    assert any(
        isinstance(m, SystemMessage)
        and "<web_search_results>" in m.content
        and "Latest News" in m.content
        for m in result["messages"]
    )


def test_websearch_node_sets_websearch_completed(monkeypatch):
    monkeypatch.setattr(
        "app.agent.graphs.websearch_agent.web_search",
        lambda query, max_results=None: _MOCK_RESULTS,
    )
    state = {"messages": [HumanMessage(content="search for weather")]}
    out = websearch_agent_node(state, {"configurable": {}})

    assert out.get("websearch_completed") is True
    assert out.get("web_search_results") == _MOCK_RESULTS


def test_websearch_subgraph_empty_query_no_results(monkeypatch):
    def _should_not_call(query, max_results=None):
        raise AssertionError("web_search should not be called for empty query")

    monkeypatch.setattr(
        "app.agent.graphs.websearch_agent.web_search", _should_not_call
    )
    state = {"messages": [HumanMessage(content="   ")]}
    graph = build_websearch_agent()
    result = graph.invoke(state, {"configurable": {}})

    assert result.get("web_search_results") == []
    assert any(
        isinstance(m, SystemMessage)
        and "<web_search_results>" in m.content
        for m in result["messages"]
    )


def test_planner_short_circuits_after_websearch_completed():
    state = {
        "messages": [HumanMessage(content="latest news")],
        "websearch_completed": True,
    }
    out = planner_mod.planner_node(state)

    assert out["next_agent"] == "chat"
    assert "websearch" in out["planner_reason"].lower()


async def test_supervisor_routes_websearch_keyword_to_subgraph_then_chat(
    monkeypatch, skills_fixture
):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    monkeypatch.setenv("SUPERVISOR_MODE", "llm")
    from app.config import get_settings

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

            return RouterOutput(next_agent="websearch", reasoning="needs current info")

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

        async def astream(self, _messages):
            from langchain_core.messages import AIMessage

            yield AIMessage(content="here is the latest news summary")

    monkeypatch.setattr("app.agent.nodes.planner.get_chat_model", lambda: _FakeLLM())
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: _FakeLLM())
    monkeypatch.setattr(
        "app.agent.graphs.websearch_agent.web_search",
        lambda query, max_results=None: _MOCK_RESULTS,
    )

    subgraph_calls = {"n": 0}
    original = websearch_agent_node

    def _counting_websearch_agent(state, config):
        subgraph_calls["n"] += 1
        return original(state, config)

    monkeypatch.setattr(
        "app.agent.graph.websearch_agent_node", _counting_websearch_agent
    )

    from app.agent.graph import build_graph

    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t-websearch-handoff"}}
    result = await graph.ainvoke(
        {"messages": [HumanMessage(content="what is the latest news today?")]},
        config,
    )

    assert subgraph_calls["n"] == 1
    assert planner_calls["n"] == 2
    assert result.get("websearch_completed") is True
    assert result.get("web_search_results") == _MOCK_RESULTS
    assert any(
        isinstance(m, SystemMessage) and "Latest News" in m.content
        for m in result["messages"]
    )
    get_settings.cache_clear()
