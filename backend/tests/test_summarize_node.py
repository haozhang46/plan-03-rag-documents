from langchain_core.messages import AIMessage, HumanMessage, RemoveMessage, SystemMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.nodes.chat import chat_node
from app.agent.nodes.summarize import estimate_tokens, summarize_node
from app.agent.routing import route_after_prepare


def test_estimate_tokens_counts_chars_div_4():
    msgs = [HumanMessage(content="a" * 8), AIMessage(content="b" * 4)]
    assert estimate_tokens(msgs) == 3


def test_summarize_not_triggered_below_threshold(monkeypatch):
    monkeypatch.setenv("SUMMARY_TOKEN_THRESHOLD", "10000")
    from app.config import get_settings

    get_settings.cache_clear()
    state = {"messages": [HumanMessage(content="short message")]}
    assert route_after_prepare(state) == "rag"
    get_settings.cache_clear()


def test_summarize_triggered_above_threshold(monkeypatch):
    monkeypatch.setenv("SUMMARY_TOKEN_THRESHOLD", "10")
    from app.config import get_settings

    get_settings.cache_clear()
    long_content = "x" * 100
    state = {"messages": [HumanMessage(content=long_content)]}
    assert route_after_prepare(state) == "summarize"
    get_settings.cache_clear()


async def test_summarize_node_sets_summary_and_trims_messages(monkeypatch):
    monkeypatch.setenv("SUMMARY_TOKEN_THRESHOLD", "10")
    from app.config import get_settings

    get_settings.cache_clear()

    class FakeLLM:
        def invoke(self, messages):
            return AIMessage(content="condensed history")

    msgs = [
        HumanMessage(content="first question"),
        AIMessage(content="first answer"),
        HumanMessage(content="second question"),
        AIMessage(content="second answer"),
        HumanMessage(content="third question"),
    ]
    out = await summarize_node({"messages": msgs}, llm=FakeLLM())
    assert out["summary"] == "condensed history"
    visible = [m for m in out["messages"] if not isinstance(m, RemoveMessage)]
    assert len(visible) == 3
    assert isinstance(visible[0], SystemMessage)
    assert "condensed history" in visible[0].content
    assert visible[-2].content == "second answer"
    assert visible[-1].content == "third question"
    get_settings.cache_clear()


async def test_chat_node_includes_summary_in_context():
    captured: list = []

    class FakeLLM:
        async def astream(self, messages):
            captured.extend(messages)
            yield AIMessage(content="reply")

    state = {
        "summary": "prior discussion about testing",
        "messages": [HumanMessage(content="continue")],
    }
    await chat_node(state, llm=FakeLLM())
    assert any(
        isinstance(m, SystemMessage)
        and "Conversation summary so far:" in m.content
        and "prior discussion about testing" in m.content
        for m in captured
    )


async def test_chat_node_skips_duplicate_summary_when_already_in_messages():
    captured: list = []

    class FakeLLM:
        async def astream(self, messages):
            captured.extend(messages)
            yield AIMessage(content="reply")

    state = {
        "summary": "prior discussion",
        "messages": [
            SystemMessage(content="Conversation summary so far:\nprior discussion"),
            HumanMessage(content="continue"),
        ],
    }
    await chat_node(state, llm=FakeLLM())
    summary_msgs = [
        m
        for m in captured
        if isinstance(m, SystemMessage) and "Conversation summary so far:" in m.content
    ]
    assert len(summary_msgs) == 1


async def test_graph_summarize_on_long_history(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    monkeypatch.setenv("SUMMARY_TOKEN_THRESHOLD", "10")
    from app.config import get_settings

    get_settings.cache_clear()

    summarize_called = {"n": 0}
    original = summarize_node

    async def counting_summarize(state, llm=None):
        summarize_called["n"] += 1
        return await original(state, llm=llm)

    monkeypatch.setattr("app.agent.graph.summarize_node", counting_summarize)

    class FakeSummarizeLLM:
        def invoke(self, messages):
            return AIMessage(content="summary text")

    class FakeChatLLM:
        async def astream(self, messages):
            yield AIMessage(content="ok")

    monkeypatch.setattr(
        "app.agent.nodes.summarize.get_chat_model", lambda: FakeSummarizeLLM()
    )
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: FakeChatLLM())

    from app.agent.graph import build_graph

    long_content = "z" * 100
    graph = build_graph(checkpointer=MemorySaver())
    result = await graph.ainvoke(
        {
            "messages": [
                HumanMessage(content=long_content),
                AIMessage(content="reply one"),
                HumanMessage(content=long_content),
            ]
        },
        {"configurable": {"thread_id": "summarize-test"}},
    )
    assert summarize_called["n"] == 1
    assert result.get("summary") == "summary text"
    get_settings.cache_clear()
