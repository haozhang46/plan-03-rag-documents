from fastapi import APIRouter, Depends, Request

from app.adapters.meshery import fetch_meshery_summary
from app.adapters.portainer import fetch_portainer_summary
from app.api.routes.resources import check_auth, get_store, require_project
from app.config import settings
from app.models.ops import OpsConfig, OpsSummary
from app.store.sqlite import TopologyStore

router = APIRouter(prefix="/v1/ops", tags=["ops"])


@router.get("/config")
def get_ops_config(request: Request) -> OpsConfig:
    check_auth(request)
    portainer_url = settings.portainer_url.strip() if settings.portainer_url else None
    meshery_url = settings.meshery_url.strip() if settings.meshery_url else None
    return OpsConfig(
        portainer_url=portainer_url or None,
        meshery_url=meshery_url or None,
    )


@router.get("/summary")
def get_ops_summary(
    request: Request,
    project: str = Depends(require_project),
    store: TopologyStore = Depends(get_store),
) -> OpsSummary:
    check_auth(request)

    docker = fetch_portainer_summary(settings.portainer_url, settings.portainer_api_token)
    kubernetes = fetch_meshery_summary(settings.meshery_url)

    topology = store.get_topology(project)
    intent_node_count = len(topology.nodes) if topology else None

    return OpsSummary(
        docker=docker,
        kubernetes=kubernetes,
        intent_node_count=intent_node_count,
    )
