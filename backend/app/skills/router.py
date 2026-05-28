from app.skills.models import SkillMeta
from app.skills.registry import SkillRegistry


class SkillRouter:
    def __init__(self, registry: SkillRegistry | None = None):
        self.registry = registry or SkillRegistry()

    def select(self, user_message: str, max_skills: int = 2) -> list[SkillMeta]:
        msg = user_message.lower()
        hits: list[SkillMeta] = []
        for meta in self.registry.list_l1():
            if self._matches(meta, msg):
                hits.append(meta)
        return hits[:max_skills]

    def _matches(self, meta: SkillMeta, msg: str) -> bool:
        for trigger in meta.triggers:
            if trigger.lower() in msg:
                return True
        slug = meta.name.replace("-", " ")
        if slug in msg:
            return True
        tokens = [t for t in meta.name.replace("-", " ").split() if len(t) > 3]
        return any(t in msg for t in tokens)
