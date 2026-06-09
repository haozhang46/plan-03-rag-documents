from fastapi import APIRouter, Request

router = APIRouter(prefix="/v1")


@router.get("/flows")
async def list_flows(request: Request):
    registry = request.app.state.graph_registry
    return {"flows": registry.list_flows()}
