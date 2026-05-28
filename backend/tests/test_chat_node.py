from langchain_core.messages import AIMessage, HumanMessage

from app.agent.nodes.chat import chat_node


class FakeLLM:
    def invoke(self, messages):
        return AIMessage(content="pong")


def test_chat_node_appends_ai_message():
    state = {"messages": [HumanMessage(content="ping")]}
    out = chat_node(state, llm=FakeLLM())
    assert out["messages"][-1].content == "pong"
