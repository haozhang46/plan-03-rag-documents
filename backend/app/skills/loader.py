import re
from pathlib import Path

from app.observability.langfuse import get_langfuse_client

_FRONTMATTER = re.compile(r"^---\s*\n.*?\n---\s*\n", re.DOTALL)


def _read_body(skill_path: Path) -> str:
    text = skill_path.read_text(encoding="utf-8")
    return _FRONTMATTER.sub("", text).strip()


def load_l2(skill_path: Path, skill_name: str = "") -> str:
    client = get_langfuse_client()
    if client:
        with client.start_as_current_observation(name="skill.load") as span:
            span.update(metadata={"skill": skill_name, "layer": "L2"})
            return _read_body(skill_path)
    return _read_body(skill_path)
