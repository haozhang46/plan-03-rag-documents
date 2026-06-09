from dataclasses import dataclass

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graphs.code_agent import build_code_agent, code_agent_node
from app.agent.tools.run_python import run_python


def test_run_python_executes_print():
    result = run_python('print("hello code")')
    assert result["exit_code"] == 0
    assert "hello code" in result["stdout"]
    assert result.get("error") is None


def test_run_python_rejects_unsafe_code():
    result = run_python("import os\nos.system('echo pwned')")
    assert result["exit_code"] != 0
    assert result.get("error")


def test_code_subgraph_success_sets_code_completed():
    state = {"messages": [HumanMessage(content="ignore")], "code_snippet": 'print("ok")'}
    graph = build_code_agent()
    result = graph.invoke(state, {"configurable": {}})

    assert result.get("code_completed") is True
    assert "code_error" not in result or result.get("code_error") is None
    assert any(
        isinstance(m, SystemMessage) and "ok" in m.content
        for m in result["messages"]
    )


def test_code_subgraph_failure_sets_code_error_no_completed():
    state = {
        "messages": [HumanMessage(content="ignore")],
        "code_snippet": "import os\nos.system('x')",
    }
    graph = build_code_agent()
    result = graph.invoke(state, {"configurable": {}})

    assert result.get("code_completed") is not True
    assert result.get("code_error")
    assert any(
        isinstance(m, SystemMessage) and result["code_error"] in m.content
        for m in result["messages"]
    )


async def test_supervisor_routes_code_to_subgraph_then_planner(
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
    monkeypatch.setattr("app.agent.graph.route_agent_node", _counting_planner)

    class _FakeStructured:
        def invoke(self, _messages):
            from app.agent.models.router import RouterOutput

            return RouterOutput(next_agent="code", reasoning="needs python execution")

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

        async def astream(self, _messages):
            from langchain_core.messages import AIMessage

            yield AIMessage(content="the result is 42")

    monkeypatch.setattr("app.agent.nodes.planner.get_chat_model", lambda: _FakeLLM())
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: _FakeLLM())

    subgraph_calls = {"n": 0}
    original = code_agent_node

    def _counting_code_agent(state, config):
        subgraph_calls["n"] += 1
        return original(state, config)

    monkeypatch.setattr("app.agent.graph.code_agent_node", _counting_code_agent)

    from app.agent.graph import build_graph

    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t-code-handoff"}}
    result = await graph.ainvoke(
        {
            "messages": [
                HumanMessage(content="```python\nprint(42)\n```"),
            ],
        },
        config,
    )

    assert subgraph_calls["n"] == 1
    assert planner_calls["n"] == 2
    assert result.get("code_completed") is True
    assert any(
        isinstance(m, SystemMessage) and "42" in m.content
        for m in result["messages"]
    )
    get_settings.cache_clear()
