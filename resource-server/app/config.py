from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="RESOURCE_SERVER_")

    host: str = "127.0.0.1"
    port: int = 9000
    db_path: str = "resource-server.db"
    auth_token: str | None = None
    portainer_url: str | None = None
    portainer_api_token: str | None = None
    meshery_url: str | None = None


settings = Settings()
