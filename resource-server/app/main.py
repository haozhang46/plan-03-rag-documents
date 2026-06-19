from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes.health import router as health_router
from app.api.routes.resources import router as resources_router
from app.api.routes.topology import deployment_router, router as topology_router

app = FastAPI(title="AgentFlow Resource Server", version="0.1.0")
app.include_router(health_router)
app.include_router(resources_router)
app.include_router(topology_router)
app.include_router(deployment_router)

ui_dir = Path(__file__).resolve().parent.parent / "ui"
if ui_dir.is_dir():
    app.mount("/ui", StaticFiles(directory=str(ui_dir), html=True), name="ui")
