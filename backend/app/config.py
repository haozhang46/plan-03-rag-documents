from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_SKILLS_ROOT = _REPO_ROOT / "skills"


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
    embedding_provider: str = "openai"
    embedding_model: str = "text-embedding-3-small"
    skills_root: str = str(_DEFAULT_SKILLS_ROOT)
    langfuse_public_key: str | None = None
    langfuse_secret_key: str | None = None
    langfuse_host: str = "https://cloud.langfuse.com"
    langfuse_enabled: bool = False
    expected_embedding_dimensions: int = 768
    client_embedding_mode: bool = False
    supervisor_mode: Literal["off", "llm"] = "off"
    summary_token_threshold: int = 4000

@lru_cache
def get_settings() -> Settings:
    return Settings()
