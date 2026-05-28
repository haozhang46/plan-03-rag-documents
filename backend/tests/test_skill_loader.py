from app.skills.loader import load_l2


def test_load_l2_strips_frontmatter(skills_fixture):
    path = skills_fixture / "test-driven-development" / "SKILL.md"
    body = load_l2(path)
    assert body.startswith("# TDD")
    assert "---" not in body.splitlines()[0]
    assert "Write failing test" in body
