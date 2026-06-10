from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.state import AgentState
from app.config import get_settings
from app.skills.loader import load_l2
from app.skills.registry import SkillRegistry
from app.skills.router import SkillRouter


def _load_skills_by_names(names: list[str], registry: SkillRegistry) -> list:
    by_name = {m.name: m for m in registry.list_l1()}
    missing = [n for n in names if n not in by_name]
    if missing:
        raise ValueError(f"unknown skill_names: {', '.join(missing)}")
    return [by_name[n] for n in names]


def _build_skill_output(selected: list, root: Path) -> dict:
    parts: list[str] = []
    spawn_parts: list[str] = []
    for meta in selected:
        body = load_l2(root / meta.path, skill_name=meta.name)
        block = f"## Skill: {meta.name}\n{body}"
        parts.append(block)
        if meta.spawn_subagent:
            spawn_parts.append(block)
    skill_prompt = "\n\n".join(parts)
    out: dict = {
        "selected_skills": [meta.name for meta in selected],
        "messages": [
            SystemMessage(content=f"<skills>\n{skill_prompt}\n</skills>")
        ],
    }
    if spawn_parts:
        out["skill_context"] = "\n\n".join(spawn_parts)
    return out


def prepare_node(state: AgentState) -> dict:
    explicit = state.get("explicit_skill_names")
    if explicit is not None:
        if not explicit:
            return {}
        registry = SkillRegistry()
        selected = _load_skills_by_names(explicit, registry)
        root = Path(get_settings().skills_root)
        return _build_skill_output(selected, root)

    last_human = next(
        m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)
    )
    router = SkillRouter()
    selected = router.select(last_human.content)
    if not selected:
        return {}
    root = Path(get_settings().skills_root)
    return _build_skill_output(selected, root)
