from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graph import build_graph


class FakeLLM:
    def invoke(self, messages):
        return AIMessage(content="ok")


def test_graph_invoke(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: FakeLLM())
    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t1"}}
    result = graph.invoke(
        {"messages": [HumanMessage(content="use tdd")]}, config
    )
    types = [type(m) for m in result["messages"]]
    assert SystemMessage in types
    assert AIMessage in types
    assert len(result["messages"]) >= 3
