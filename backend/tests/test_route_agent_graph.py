from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graphs.route_agent import build_route_agent, route_agent_node
from app.agent.models.router import RouterOutput
from app.agent.nodes import planner as planner_mod


def test_route_subgraph_sets_next_agent(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))

    class _FakeStructured:
        def invoke(self, _messages):
            return RouterOutput(next_agent="code", reasoning="needs calculation")

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

    monkeypatch.setattr(planner_mod, "get_chat_model", lambda: _FakeLLM())

    state = {"messages": [HumanMessage(content="用 python 计算 1+1")]}
    result = build_route_agent().invoke(state, {"configurable": {}})

    assert result["next_agent"] == "code"
    assert result["planner_reason"] == "needs calculation"


def test_route_agent_node_emits_langfuse_subgraph_span(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    calls = []

    class _FakeClient:
        def start_as_current_observation(self, **kwargs):
            calls.append(kwargs)

            class _Span:
                def __enter__(self):
                    return self

                def __exit__(self, *args):
                    pass

                def update(self, **kwargs):
                    calls.append(kwargs)

            return _Span()

    monkeypatch.setattr(
        "app.agent.graphs.route_agent.get_langfuse_client", lambda: _FakeClient()
    )
    monkeypatch.setattr(
        planner_mod,
        "planner_node",
        lambda state: {"next_agent": "chat", "planner_reason": "ok"},
    )

    route_agent_node(
        {"messages": [HumanMessage(content="hello")]}, {"configurable": {}}
    )

    assert any(c.get("name") == "subgraph.invoke" for c in calls)
    assert any(c.get("metadata", {}).get("name") == "route_agent" for c in calls)


async def test_supervisor_uses_route_agent_node(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    monkeypatch.setenv("SUPERVISOR_MODE", "llm")
    from app.config import get_settings
    from app.agent.graph import build_graph

    get_settings.cache_clear()

    route_calls = {"n": 0}
    original = route_agent_node

    def _counting_route(state, config):
        route_calls["n"] += 1
        return original(state, config)

    monkeypatch.setattr("app.agent.graph.route_agent_node", _counting_route)

    class _FakeStructured:
        def invoke(self, _messages):
            return RouterOutput(next_agent="chat", reasoning="general")

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

        async def astream(self, _messages):
            from langchain_core.messages import AIMessage

            yield AIMessage(content="hi")

    monkeypatch.setattr(planner_mod, "get_chat_model", lambda: _FakeLLM())
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: _FakeLLM())

    graph = build_graph(checkpointer=MemorySaver())
    await graph.ainvoke(
        {"messages": [HumanMessage(content="hello")]},
        {"configurable": {"thread_id": "route-agent-test"}},
    )

    assert route_calls["n"] >= 1
    get_settings.cache_clear()
