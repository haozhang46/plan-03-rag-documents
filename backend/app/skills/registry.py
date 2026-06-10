import io
import shutil
import zipfile
from pathlib import Path

import yaml

from app.config import get_settings
from app.skills.models import SkillMeta, SkillVisibility


class SkillRegistry:
    def __init__(self, root: Path | None = None):
        self.root = Path(root) if root is not None else Path(get_settings().skills_root)

    @property
    def registry_path(self) -> Path:
        return self.root / "registry.yaml"

    def list_l1(self) -> list[SkillMeta]:
        data = yaml.safe_load(self.registry_path.read_text(encoding="utf-8"))
        return [SkillMeta(**row) for row in data["skills"]]

    def list_for_tenant(self, tenant_id: str | None) -> list[SkillMeta]:
        visible: list[SkillMeta] = []
        for meta in self.list_l1():
            if meta.visibility == SkillVisibility.public:
                visible.append(meta)
            elif tenant_id and meta.tenant_id == tenant_id:
                visible.append(meta)
        return visible

    def register(self, meta: SkillMeta) -> SkillMeta:
        skill_path = self.root / meta.path
        if not skill_path.is_file():
            raise FileNotFoundError(f"skill file not found: {meta.path}")

        data = yaml.safe_load(self.registry_path.read_text(encoding="utf-8"))
        skills = data.setdefault("skills", [])
        for existing in skills:
            if existing["name"] == meta.name:
                raise ValueError(f"skill already registered: {meta.name}")

        row = meta.model_dump(mode="json")
        if row.get("tenant_id") is None:
            row.pop("tenant_id", None)
        skills.append(row)
        self._write_registry(data)
        return meta

    def import_zip(self, tenant_id: str, zip_bytes: bytes) -> list[SkillMeta]:
        dest_root = self.root / tenant_id
        dest_root.mkdir(parents=True, exist_ok=True)

        registered: list[SkillMeta] = []
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            skill_dirs = self._skill_dirs_in_zip(zf)
            if not skill_dirs:
                raise ValueError("zip contains no skill directories with SKILL.md")

            for skill_name in sorted(skill_dirs):
                target_dir = dest_root / skill_name
                if target_dir.exists():
                    shutil.rmtree(target_dir)
                target_dir.mkdir(parents=True, exist_ok=True)

                prefix = f"{skill_name}/"
                for info in zf.infolist():
                    if info.is_dir() or not info.filename.startswith(prefix):
                        continue
                    rel = info.filename[len(prefix) :]
                    if not rel or rel.endswith("/"):
                        continue
                    out_path = target_dir / rel
                    out_path.parent.mkdir(parents=True, exist_ok=True)
                    out_path.write_bytes(zf.read(info))

                skill_md = target_dir / "SKILL.md"
                if not skill_md.is_file():
                    raise ValueError(f"missing SKILL.md for {skill_name}")

                rel_path = f"{tenant_id}/{skill_name}/SKILL.md"
                meta = SkillMeta(
                    name=skill_name,
                    description=f"Imported skill {skill_name}",
                    path=rel_path,
                    visibility=SkillVisibility.private,
                    tenant_id=tenant_id,
                    triggers=[skill_name.replace("-", " ")],
                )
                try:
                    registered.append(self.register(meta))
                except ValueError:
                    data = yaml.safe_load(self.registry_path.read_text(encoding="utf-8"))
                    skills = data.setdefault("skills", [])
                    for i, row in enumerate(skills):
                        if row["name"] == skill_name:
                            skills[i] = meta.model_dump(mode="json")
                            break
                    self._write_registry(data)
                    registered.append(meta)

        return registered

    def _skill_dirs_in_zip(self, zf: zipfile.ZipFile) -> set[str]:
        dirs: set[str] = set()
        for info in zf.infolist():
            if info.is_dir():
                continue
            parts = Path(info.filename).parts
            if len(parts) >= 2 and parts[1] == "SKILL.md":
                dirs.add(parts[0])
        return dirs

    def _write_registry(self, data: dict) -> None:
        self.registry_path.write_text(
            yaml.safe_dump(data, sort_keys=False, allow_unicode=True),
            encoding="utf-8",
        )
