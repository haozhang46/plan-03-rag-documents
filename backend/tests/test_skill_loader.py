from app.skills.loader import load_l2


def test_load_l2_strips_frontmatter(skills_fixture):
    path = skills_fixture / "test-driven-development" / "SKILL.md"
    body = load_l2(path)
    assert body.startswith("# Test-Driven Development")
    assert "---" not in body.splitlines()[0]
    assert "Write the test first" in body
