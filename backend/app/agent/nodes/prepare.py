from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.state import AgentState
from app.config import get_settings
from app.skills.loader import load_l2
from app.skills.router import SkillRouter


def prepare_node(state: AgentState) -> dict:
    last_human = next(
        m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)
    )
    router = SkillRouter()
    selected = router.select(last_human.content)
    if not selected:
        return {}
    root = Path(get_settings().skills_root)
    parts: list[str] = []
    for meta in selected:
        body = load_l2(root / meta.path)
        parts.append(f"## Skill: {meta.name}\n{body}")
    skill_prompt = "\n\n".join(parts)
    return {
        "messages": [
            SystemMessage(content=f"<skills>\n{skill_prompt}\n</skills>")
        ]
    }
