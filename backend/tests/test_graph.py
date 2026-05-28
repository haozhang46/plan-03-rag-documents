from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graph import build_graph


class FakeLLM:
    def invoke(self, messages):
        return AIMessage(content="ok")


def test_graph_invoke(monkeypatch):
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: FakeLLM())
    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t1"}}
    result = graph.invoke({"messages": [HumanMessage(content="hi")]}, config)
    assert len(result["messages"]) >= 2
