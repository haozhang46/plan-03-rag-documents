import re
from pathlib import Path

_FRONTMATTER = re.compile(r"^---\s*\n.*?\n---\s*\n", re.DOTALL)


def load_l2(skill_path: Path) -> str:
    text = skill_path.read_text(encoding="utf-8")
    return _FRONTMATTER.sub("", text).strip()
