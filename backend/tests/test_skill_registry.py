from app.skills.models import SkillType
from app.skills.registry import SkillRegistry


def test_load_l1_returns_all_skills(skills_fixture):
    reg = SkillRegistry(root=skills_fixture)
    items = reg.list_l1()
    assert len(items) >= 14
    names = {m.name for m in items}
    assert "test-driven-development" in names
    tdd = next(m for m in items if m.name == "test-driven-development")
    assert tdd.skill_type == SkillType.instruction
    assert "tdd" in tdd.triggers


def test_load_l1_workflow_has_spawn_flag(skills_fixture):
    reg = SkillRegistry(root=skills_fixture)
    workflow = next(m for m in reg.list_l1() if m.name == "subagent-driven-development")
    assert workflow.skill_type == SkillType.workflow
    assert workflow.spawn_subagent is True
