from pathlib import Path

import yaml

from app.config import get_settings
from app.skills.models import SkillMeta


class SkillRegistry:
    def __init__(self, root: Path | None = None):
        self.root = Path(root) if root is not None else Path(get_settings().skills_root)

    def list_l1(self) -> list[SkillMeta]:
        registry_path = self.root / "registry.yaml"
        data = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
        return [SkillMeta(**row) for row in data["skills"]]
