from langchain_core.messages import SystemMessage

from app.agent.graphs.code_agent import build_code_agent
from app.skills.loader import load_l3


def test_load_l3_returns_relevant_reference_when_query_matches(skills_fixture):
    refs_dir = skills_fixture / "test-driven-development" / "references"
    refs_dir.mkdir(parents=True, exist_ok=True)
    (refs_dir / "tdd-cycle.md").write_text(
        "# Red-Green-Refactor\n\nWrite a failing test first (RED), "
        "make it pass (GREEN), then refactor.",
        encoding="utf-8",
    )
    (refs_dir / "other.md").write_text(
        "# Unrelated\n\nDatabase migration tips.",
        encoding="utf-8",
    )

    result = load_l3("test-driven-development", "red green refactor failing test", skills_fixture)

    assert "Red-Green-Refactor" in result
    assert "Database migration" not in result


def test_load_l3_returns_empty_string_when_no_references_dir(skills_fixture):
    result = load_l3("test-driven-development", "anything", skills_fixture)
    assert result == ""


def test_code_agent_failure_with_selected_skills_includes_l3_content(skills_fixture):
    refs_dir = skills_fixture / "test-driven-development" / "references"
    refs_dir.mkdir(parents=True, exist_ok=True)
    (refs_dir / "tdd-cycle.md").write_text(
        "# Red-Green-Refactor\n\nFix failing tests with minimal code changes.",
        encoding="utf-8",
    )

    state = {
        "messages": [SystemMessage(content="ignore")],
        "code_snippet": "import os\nos.system('x')",
        "selected_skills": ["test-driven-development"],
    }
    graph = build_code_agent()
    result = graph.invoke(state, {"configurable": {}})

    assert result.get("code_error")
    l3_messages = [
        m
        for m in result["messages"]
        if isinstance(m, SystemMessage) and "<l3_refs>" in m.content
    ]
    assert len(l3_messages) == 1
    assert "Red-Green-Refactor" in l3_messages[0].content
    assert result.get("l3_context")
