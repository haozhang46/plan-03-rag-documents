from app.skills.registry import SkillRegistry


def resolve_skill_names(
    request_names: list[str] | None,
    flow_default_names: list[str],
) -> list[str] | None:
    """Return explicit skill names, or None to use SkillRouter auto-match."""
    if request_names:
        return list(request_names)
    if flow_default_names:
        return list(flow_default_names)
    return None


def validate_skill_names(names: list[str], registry: SkillRegistry | None = None) -> list[str]:
    reg = registry or SkillRegistry()
    known = {m.name for m in reg.list_for_tenant(None)}
    unknown = [n for n in names if n not in known]
    if unknown:
        raise ValueError(f"unknown skill_names: {', '.join(unknown)}")
    return names
