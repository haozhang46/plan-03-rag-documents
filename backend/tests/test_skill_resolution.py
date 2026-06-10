from langchain_core.messages import HumanMessage

from app.agent.nodes.prepare import prepare_node
from app.skills.resolve import resolve_skill_names, validate_skill_names


def test_resolve_request_overrides_flow_defaults():
    names = resolve_skill_names(
        ["test-driven-development"],
        ["subagent-driven-development"],
    )
    assert names == ["test-driven-development"]


def test_resolve_flow_defaults_when_request_empty():
    names = resolve_skill_names(None, ["subagent-driven-development"])
    assert names == ["subagent-driven-development"]


def test_resolve_auto_when_both_empty():
    assert resolve_skill_names(None, []) is None


def test_prepare_uses_explicit_skill_names(skills_fixture, monkeypatch):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()

    state = {
        "messages": [HumanMessage(content="hello")],
        "explicit_skill_names": ["test-driven-development"],
    }
    out = prepare_node(state)
    assert "test-driven-development" in out["selected_skills"]
    assert "TDD" in out["messages"][0].content or "test" in out["messages"][0].content.lower()


def test_validate_skill_names_rejects_unknown():
    try:
        validate_skill_names(["not-a-real-skill"])
        assert False
    except ValueError as exc:
        assert "unknown skill_names" in str(exc)
