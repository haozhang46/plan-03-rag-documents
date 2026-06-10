from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.nodes.prepare import prepare_node


def test_prepare_injects_skills_system_message(skills_fixture, monkeypatch):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()

    state = {"messages": [HumanMessage(content="use tdd here")]}
    out = prepare_node(state)
    assert "messages" in out
    sys_msg = out["messages"][0]
    assert isinstance(sys_msg, SystemMessage)
    assert "<skills>" in sys_msg.content
    assert "test-driven-development" in sys_msg.content
    assert "# TDD" in sys_msg.content


def test_prepare_noop_when_no_match(skills_fixture, monkeypatch):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()

    state = {"messages": [HumanMessage(content="hello")]}
    assert prepare_node(state) == {}
    get_settings.cache_clear()


def test_prepare_sets_use_web_search_for_current_info(skills_fixture, monkeypatch):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    monkeypatch.setenv("WEB_SEARCH_ENABLED", "true")
    from app.config import get_settings

    get_settings.cache_clear()
    monkeypatch.setattr(
        "app.agent.nodes.prepare.classify_web_search_intent",
        lambda _msg: (True, "needs live news"),
    )

    state = {"messages": [HumanMessage(content="今天有什么新闻")]}
    out = prepare_node(state)
    assert out["use_web_search"] is True
    assert out["web_search_reason"] == "needs live news"
    get_settings.cache_clear()


def test_prepare_respects_explicit_use_web_search(skills_fixture, monkeypatch):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    monkeypatch.setenv("WEB_SEARCH_ENABLED", "true")
    from app.config import get_settings

    get_settings.cache_clear()

    state = {
        "messages": [HumanMessage(content="今天有什么新闻")],
        "use_web_search": False,
    }
    out = prepare_node(state)
    assert "use_web_search" not in out
    get_settings.cache_clear()
