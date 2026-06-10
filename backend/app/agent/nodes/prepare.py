from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.intent import classify_web_search_intent
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


def _last_human_message(state: AgentState) -> HumanMessage | None:
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            return msg
    return None


def _resolve_web_search_intent(state: AgentState) -> dict:
    if state.get("use_web_search") is not None:
        return {}
    if not get_settings().web_search_enabled:
        return {}
    last_human = _last_human_message(state)
    if last_human is None or not last_human.content.strip():
        return {"use_web_search": False}
    use, reason = classify_web_search_intent(last_human.content)
    return {"use_web_search": use, "web_search_reason": reason}


def _prepare_skills(state: AgentState) -> dict:
    explicit = state.get("explicit_skill_names")
    if explicit is not None:
        if not explicit:
            return {}
        registry = SkillRegistry()
        selected = _load_skills_by_names(explicit, registry)
        root = Path(get_settings().skills_root)
        return _build_skill_output(selected, root)

    last_human = _last_human_message(state)
    if last_human is None:
        return {}

    router = SkillRouter()
    selected = router.select(last_human.content)
    if not selected:
        return {}
    root = Path(get_settings().skills_root)
    return _build_skill_output(selected, root)


def prepare_node(state: AgentState) -> dict:
    out = _resolve_web_search_intent(state)
    out.update(_prepare_skills(state))
    return out
