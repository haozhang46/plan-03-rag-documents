from app.skills.registry import SkillRegistry
from app.skills.router import SkillRouter


def test_select_hits_tdd_by_trigger(skills_fixture):
    router = SkillRouter(registry=SkillRegistry(root=skills_fixture))
    hits = router.select("please use tdd for this feature")
    assert len(hits) == 1
    assert hits[0].name == "test-driven-development"


def test_select_hits_by_name_token(skills_fixture):
    router = SkillRouter(registry=SkillRegistry(root=skills_fixture))
    hits = router.select("follow test driven development")
    assert any(h.name == "test-driven-development" for h in hits)


def test_select_empty_when_no_match(skills_fixture):
    router = SkillRouter(registry=SkillRegistry(root=skills_fixture))
    assert router.select("hello world") == []


def test_select_respects_max_skills(skills_fixture):
    router = SkillRouter(registry=SkillRegistry(root=skills_fixture))
    hits = router.select("tdd and subagent plan", max_skills=1)
    assert len(hits) == 1
