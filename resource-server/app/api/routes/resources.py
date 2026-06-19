from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.config import settings
from app.models.topology import Topology
from app.store.sqlite import TopologyStore

router = APIRouter(prefix="/v1/resources", tags=["resources"])


def get_store() -> TopologyStore:
    return TopologyStore(settings.db_path)


def require_project(project: str | None = Query(default=None)) -> str:
    if not project or not project.strip():
        raise HTTPException(status_code=400, detail="project query param is required")
    return project.strip()


def check_auth(request: Request) -> None:
    if not settings.auth_token:
        return
    token = request.headers.get("X-Resource-Token")
    if token != settings.auth_token:
        raise HTTPException(status_code=401, detail="invalid resource token")


@router.get("/config")
def get_resources_config(
    request: Request,
    project: str = Depends(require_project),
    store: TopologyStore = Depends(get_store),
) -> dict:
    check_auth(request)
    return {"instances": store.get_instances(project)}
