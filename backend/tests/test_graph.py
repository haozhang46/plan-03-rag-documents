from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graph import build_graph


async def test_graph_invoke(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()
    fake = GenericFakeChatModel(messages=iter(["ok"]))
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: fake)
    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t1"}}
    result = await graph.ainvoke(
        {"messages": [HumanMessage(content="use tdd")]}, config
    )
    types = [type(m) for m in result["messages"]]
    assert SystemMessage in types
    assert len(result["messages"]) >= 3
