from app.skills.models import SkillMeta, SkillType


def test_skill_meta_parses_registry_row():
    meta = SkillMeta(
        name="test-driven-development",
        description="Use when implementing features",
        skill_type=SkillType.instruction,
        spawn_subagent=False,
        path="test-driven-development/SKILL.md",
        triggers=["tdd"],
    )
    assert meta.skill_type == SkillType.instruction
    assert meta.triggers == ["tdd"]
