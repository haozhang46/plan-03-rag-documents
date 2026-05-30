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


async def test_supervisor_graph_skips_rag_when_planner_chooses_chat(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    monkeypatch.setenv("SUPERVISOR_MODE", "llm")
    from app.config import get_settings

    get_settings.cache_clear()

    class _FakeStructured:
        def invoke(self, _messages):
            from app.agent.models.router import RouterOutput

            return RouterOutput(next_agent="chat", reasoning="general question")

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

        async def astream(self, _messages):
            from langchain_core.messages import AIMessage

            yield AIMessage(content="hi")

    fake = _FakeLLM()
    monkeypatch.setattr("app.agent.nodes.planner.get_chat_model", lambda: fake)
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: fake)

    rag_called = {"n": 0}
    original_rag = __import__("app.agent.nodes.rag", fromlist=["rag_node"]).rag_node

    def _counting_rag(state, config):
        rag_called["n"] += 1
        return original_rag(state, config)

    monkeypatch.setattr("app.agent.nodes.rag.rag_node", _counting_rag)

    from app.agent.graph import build_graph

    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t-supervisor"}}
    await graph.ainvoke(
        {
            "messages": [HumanMessage(content="hello")],
            "document_ids": ["d1"],
        },
        config,
    )

    assert rag_called["n"] == 0
    get_settings.cache_clear()
