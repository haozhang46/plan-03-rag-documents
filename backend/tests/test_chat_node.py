from langchain_core.messages import AIMessageChunk, HumanMessage

from app.agent.nodes.chat import chat_node


class FakeLLM:
    async def astream(self, messages):
        yield AIMessageChunk(content="pong")


async def test_chat_node_appends_ai_message():
    state = {"messages": [HumanMessage(content="ping")]}
    out = await chat_node(state, llm=FakeLLM())
    assert out["messages"][-1].content == "pong"
