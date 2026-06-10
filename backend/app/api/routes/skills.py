from fastapi import APIRouter, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from app.auth.skill_admin import require_skill_admin, require_skill_write
from app.auth.tenant import TenantDep, get_tenant_id
from app.config import get_settings
from app.skills.models import SkillMeta, SkillType, SkillVisibility
from app.skills.registry import SkillRegistry

router = APIRouter(prefix="/v1")


class RegisterSkillRequest(BaseModel):
    name: str
    description: str
    path: str
    visibility: SkillVisibility = SkillVisibility.public
    triggers: list[str] = Field(default_factory=list)
    skill_type: SkillType = SkillType.instruction
    spawn_subagent: bool = False
    tenant_id: str | None = None


def _registry() -> SkillRegistry:
    return SkillRegistry()


def _resolve_tenant(tenant_id: TenantDep, request: Request) -> str | None:
    if tenant_id is not None:
        return tenant_id
    return get_tenant_id(request)


@router.get("/skills")
async def list_skills(request: Request, tenant_id: TenantDep):
    settings = get_settings()
    effective_tenant = _resolve_tenant(tenant_id, request)
    if settings.tenant_mode and not effective_tenant:
        raise HTTPException(status_code=401, detail="tenant required")

    items = _registry().list_for_tenant(effective_tenant)
    return {"skills": [item.model_dump(mode="json") for item in items]}


@router.post("/skills")
async def register_skill(
    body: RegisterSkillRequest, request: Request, tenant_id: TenantDep
):
    effective_tenant = _resolve_tenant(tenant_id, request)
    skill_tenant = body.tenant_id or effective_tenant
    if body.visibility == SkillVisibility.private and not skill_tenant:
        raise HTTPException(status_code=400, detail="tenant_id required for private skills")

    require_skill_write(
        request,
        effective_tenant,
        visibility=body.visibility.value,
        target_tenant_id=skill_tenant,
    )

    meta = SkillMeta(
        name=body.name,
        description=body.description,
        path=body.path,
        visibility=body.visibility,
        triggers=body.triggers,
        skill_type=body.skill_type,
        spawn_subagent=body.spawn_subagent,
        tenant_id=skill_tenant if body.visibility == SkillVisibility.private else None,
    )

    try:
        registered = _registry().register(meta)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return registered.model_dump(mode="json")


@router.post("/skills/import")
async def import_skills(
    file: UploadFile, request: Request, tenant_id: TenantDep
):
    settings = get_settings()
    effective_tenant = _resolve_tenant(tenant_id, request)
    if settings.tenant_mode and not effective_tenant:
        raise HTTPException(status_code=401, detail="tenant required")

    require_skill_admin(request, effective_tenant)

    zip_bytes = await file.read()
    if not zip_bytes:
        raise HTTPException(status_code=400, detail="empty zip file")

    try:
        imported = _registry().import_zip(effective_tenant or "default", zip_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"skills": [item.model_dump(mode="json") for item in imported]}
