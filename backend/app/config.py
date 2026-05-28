from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "agent-flow"
    database_url: str = "postgresql://agent:agent@localhost:5432/agentflow"
    # auto = 先试 Postgres，连不上则用 MemorySaver（本地无 Docker 时）
    checkpointer: str = "auto"
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    default_llm_provider: str = "openai"
    default_model: str = "gpt-4o-mini"


@lru_cache
def get_settings() -> Settings:
    return Settings()
