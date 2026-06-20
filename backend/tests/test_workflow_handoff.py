from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.models.router import RouterOutput
from app.agent.nodes import planner as planner_mod
from app.agent.nodes.prepare import prepare_node


def test_prepare_sets_selected_skills(skills_fixture, monkeypatch):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()

    state = {"messages": [HumanMessage(content="use subagent workflow")]}
    out = prepare_node(state)

    assert "selected_skills" in out
    assert "subagent-driven-development" in out["selected_skills"]
    assert "skill_context" in out
    assert "Subagent-Driven Development" in out["skill_context"]

    get_settings.cache_clear()


def test_planner_spawn_subagent_routes_to_code(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()

    class _FakeStructured:
        def invoke(self, _messages):
            return RouterOutput(next_agent="chat", reasoning="general chat")

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

    monkeypatch.setattr(planner_mod, "get_chat_model", lambda: _FakeLLM())

    state = {
        "messages": [HumanMessage(content="use subagent")],
        "selected_skills": ["subagent-driven-development"],
    }
    out = planner_mod.planner_node(state)

    assert out["next_agent"] == "code"
    assert "workflow handoff" in out["planner_reason"].lower()

    get_settings.cache_clear()


def test_code_agent_injects_skill_context_only(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()

    injected = []

    def _capture_invoke(state, config):
        for msg in state["messages"]:
            if isinstance(msg, SystemMessage) and "<skills>" in msg.content:
                injected.append(msg.content)
        return {"code_completed": True, "messages": []}

    from app.agent.graphs import code_agent as code_agent_mod

    monkeypatch.setattr(code_agent_mod._code_agent, "invoke", _capture_invoke)

    state = {
        "messages": [HumanMessage(content="run subagent plan")],
        "skill_context": "## Skill: subagent-driven-development\n# Subagent-driven development",
        "code_snippet": 'print("ok")',
    }
    code_agent_mod.code_agent_node(state, {"configurable": {}})

    assert len(injected) == 1
    assert "subagent-driven-development" in injected[0]
    assert "using-superpowers" not in injected[0]

    get_settings.cache_clear()


async def test_workflow_skill_triggers_code_subgraph(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    monkeypatch.setenv("SUPERVISOR_MODE", "llm")
    from app.config import get_settings
    from app.agent.graphs.code_agent import code_agent_node
    from app.agent.graph import build_graph

    get_settings.cache_clear()

    class _FakeStructured:
        def invoke(self, _messages):
            return RouterOutput(next_agent="chat", reasoning="would choose chat")

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

        async def astream(self, _messages):
            from langchain_core.messages import AIMessage

            yield AIMessage(content="done")

    monkeypatch.setattr("app.agent.nodes.planner.get_chat_model", lambda: _FakeLLM())
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: _FakeLLM())

    subgraph_calls = {"n": 0}
    original = code_agent_node

    def _counting_code_agent(state, config):
        subgraph_calls["n"] += 1
        return original(state, config)

    monkeypatch.setattr("app.agent.graph.code_agent_node", _counting_code_agent)

    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t-workflow-handoff"}}
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content="please use subagent for this task")],
            "code_snippet": 'print("handoff")',
        },
        config,
    )

    assert subgraph_calls["n"] == 1
    assert result.get("code_completed") is True

    get_settings.cache_clear()
