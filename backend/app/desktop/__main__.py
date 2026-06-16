import uvicorn

from app.config import get_settings
from app.desktop.app import create_app


def main() -> None:
    settings = get_settings()
    app = create_app(settings)
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=settings.sidecar_port,
        log_level="info",
    )


if __name__ == "__main__":
    main()
