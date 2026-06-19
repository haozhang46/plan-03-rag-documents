from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from app.adapters.compose import export_compose, import_compose
from app.models.topology import Topology
from app.services.topology import deployment_summary, format_topology_markdown
from app.store.sqlite import TopologyStore
from app.api.routes.resources import check_auth, get_store, require_project

router = APIRouter(prefix="/v1/topology", tags=["topology"])


class ImportRequest(BaseModel):
    format: str
    content: str | None = None
    url: str | None = None


class ExportRequest(BaseModel):
    format: str
    target_id: str | None = None


@router.get("")
def get_topology(
    request: Request,
    project: str = Depends(require_project),
    store: TopologyStore = Depends(get_store),
) -> Topology:
    check_auth(request)
    topology = store.get_topology(project)
    if topology is None:
        raise HTTPException(status_code=404, detail="topology not found")
    return topology


@router.put("")
def put_topology(
    request: Request,
    body: Topology,
    project: str = Depends(require_project),
    store: TopologyStore = Depends(get_store),
) -> Topology:
    check_auth(request)
    body.project = project
    store.save_topology(project, body)
    return body


@router.get("/markdown")
def get_topology_markdown(
    request: Request,
    project: str = Depends(require_project),
    store: TopologyStore = Depends(get_store),
) -> dict[str, str]:
    check_auth(request)
    topology = store.get_topology(project)
    if topology is None:
        return {"markdown": ""}
    return {"markdown": format_topology_markdown(topology)}


@router.post("/import")
def import_topology(
    request: Request,
    body: ImportRequest,
    project: str = Depends(require_project),
    store: TopologyStore = Depends(get_store),
) -> Topology:
    check_auth(request)
    if body.format != "compose":
        raise HTTPException(status_code=501, detail=f"import format {body.format} not implemented")
    if not body.content:
        raise HTTPException(status_code=400, detail="content is required")
    topology = import_compose(body.content, project=project)
    store.save_topology(project, topology)
    return topology


@router.post("/export")
def export_topology(
    request: Request,
    body: ExportRequest,
    project: str = Depends(require_project),
    store: TopologyStore = Depends(get_store),
) -> dict[str, str]:
    check_auth(request)
    topology = store.get_topology(project)
    if topology is None:
        raise HTTPException(status_code=404, detail="topology not found")
    if body.format != "compose":
        raise HTTPException(status_code=501, detail=f"export format {body.format} not implemented")
    return {"content": export_compose(topology)}


deployment_router = APIRouter(prefix="/v1/deployment", tags=["deployment"])


@deployment_router.get("/summary")
def get_deployment_summary(
    request: Request,
    project: str = Depends(require_project),
    store: TopologyStore = Depends(get_store),
) -> dict:
    check_auth(request)
    topology = store.get_topology(project)
    return deployment_summary(topology)
