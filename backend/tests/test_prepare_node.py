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
