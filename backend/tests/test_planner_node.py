from langchain_core.messages import HumanMessage

from app.agent.models.router import RouterOutput
from app.agent.nodes import planner as planner_mod


class _FakeStructured:
    def __init__(self, result: RouterOutput):
        self._result = result

    def invoke(self, _messages):
        return self._result


class _FakeLLM:
    def __init__(self, result: RouterOutput):
        self._result = result

    def with_structured_output(self, _schema):
        return _FakeStructured(self._result)


def test_planner_node_sets_next_agent_from_llm(monkeypatch):
    fake = _FakeLLM(RouterOutput(next_agent="rag", reasoning="needs retrieval"))
    monkeypatch.setattr(planner_mod, "get_chat_model", lambda: fake)

    state = {
        "messages": [HumanMessage(content="what does the doc say?")],
        "document_ids": ["d1"],
    }
    out = planner_mod.planner_node(state)

    assert out["next_agent"] == "rag"
    assert out["planner_reason"] == "needs retrieval"


def test_planner_node_falls_back_on_llm_error(monkeypatch):
    def _boom():
        raise RuntimeError("no api key")

    monkeypatch.setattr(planner_mod, "get_chat_model", _boom)

    state = {
        "messages": [HumanMessage(content="summarize the uploaded file")],
        "document_ids": ["d1"],
    }
    out = planner_mod.planner_node(state)

    assert out["next_agent"] == "rag"
    assert "fallback" in out["planner_reason"].lower()


def test_planner_emits_langfuse_span_when_enabled(monkeypatch):
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
        "app.agent.nodes.planner.get_langfuse_client", lambda: _FakeClient()
    )
    monkeypatch.setenv("LANGFUSE_ENABLED", "true")
    monkeypatch.setattr(
        planner_mod,
        "get_chat_model",
        lambda: _FakeLLM(RouterOutput(next_agent="chat", reasoning="ok")),
    )

    state = {"messages": [HumanMessage(content="hi")]}
    planner_mod.planner_node(state)

    assert any(c.get("name") == "planner.route" for c in calls)
