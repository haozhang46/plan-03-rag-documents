import re
from pathlib import Path

from app.config import get_settings
from app.observability.langfuse import get_langfuse_client

_FRONTMATTER = re.compile(r"^---\s*\n.*?\n---\s*\n", re.DOTALL)
_L3_MAX_CHARS = 2000


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


def load_l3(skill_name: str, query: str, skills_root: Path | None = None) -> str:
    """Load L3 reference snippets for a skill.

    Convention: skills/{skill_name}/references/*.md — markdown reference files
    searched by simple keyword scoring against query tokens; returns top match.
    """
    root = skills_root or Path(get_settings().skills_root)
    refs_dir = root / skill_name / "references"
    if not refs_dir.is_dir():
        return ""

    tokens = [t for t in re.split(r"\W+", query.lower()) if t]
    if not tokens:
        return ""

    best_score = -1
    best_content = ""
    for ref_path in sorted(refs_dir.glob("*.md")):
        content = ref_path.read_text(encoding="utf-8")
        lower = content.lower()
        score = sum(lower.count(token) for token in tokens)
        if score > best_score:
            best_score = score
            best_content = content

    if best_score <= 0:
        return ""

    if len(best_content) > _L3_MAX_CHARS:
        best_content = best_content[:_L3_MAX_CHARS] + "\n…"

    client = get_langfuse_client()
    if client:
        with client.start_as_current_observation(name="skill.load") as span:
            span.update(metadata={"skill": skill_name, "layer": "L3"})
            return best_content
    return best_content
