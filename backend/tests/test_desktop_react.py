import pytest
from langchain_core.messages import AIMessage, HumanMessage

from app.agent.graphs.react_agent import _should_continue, build_react_graph
from app.agent.tools.desktop.executor_client import ExecutorError, call_executor


def test_call_executor_success(monkeypatch):
    class Resp:
        def raise_for_status(self):
            return None

        def json(self):
            return {"ok": True, "output": "hello"}

    monkeypatch.setattr(
        "app.agent.tools.desktop.executor_client.httpx.post",
        lambda *a, **k: Resp(),
    )
    assert call_executor("read_file", {"path": "a.txt"}) == "hello"


def test_call_executor_error(monkeypatch):
    class Resp:
        def raise_for_status(self):
            return None

        def json(self):
            return {"ok": False, "error": "denied"}

    monkeypatch.setattr(
        "app.agent.tools.desktop.executor_client.httpx.post",
        lambda *a, **k: Resp(),
    )
    with pytest.raises(ExecutorError, match="denied"):
        call_executor("read_file", {"path": "a.txt"})


def test_should_continue_stops_without_tool_calls():
    state = {"messages": [AIMessage(content="done")], "react_iteration": 0}
    assert _should_continue(state) == "__end__"


def test_should_continue_routes_to_tools():
    ai = AIMessage(content="", tool_calls=[{"name": "git_status", "args": {}, "id": "1"}])
    state = {"messages": [HumanMessage(content="hi"), ai], "react_iteration": 0}
    assert _should_continue(state) == "tools"


def test_should_continue_respects_max_iterations(monkeypatch):
    monkeypatch.setenv("REACT_MAX_ITERATIONS", "2")
    from app.config import get_settings

    get_settings.cache_clear()
    ai = AIMessage(content="", tool_calls=[{"name": "git_status", "args": {}, "id": "1"}])
    state = {"messages": [ai], "react_iteration": 2}
    assert _should_continue(state) == "__end__"
    get_settings.cache_clear()


def test_build_react_graph_compiles():
    graph = build_react_graph()
    assert graph is not None
