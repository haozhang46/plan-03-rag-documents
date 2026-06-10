from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_SKILLS_ROOT = _REPO_ROOT / "skills"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_REPO_ROOT / ".env"), extra="ignore"
    )

    app_name: str = "agent-flow"
    database_url: str = "postgresql://agent:agent@localhost:5432/agentflow"
    # auto = 先试 Postgres，连不上则用 MemorySaver（本地无 Docker 时）
    checkpointer: str = "auto"
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    deepseek_api_key: str | None = None
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    default_llm_provider: str = "openai"
    default_model: str = "gpt-4o-mini"
    skills_root: str = str(_DEFAULT_SKILLS_ROOT)
    langfuse_public_key: str | None = None
    langfuse_secret_key: str | None = None
    langfuse_host: str = "https://cloud.langfuse.com"
    langfuse_enabled: bool = False
    supervisor_mode: Literal["off", "llm"] = "off"
    dispatch_mode: Literal["sequential", "parallel"] = "sequential"
    review_mode: Literal["off", "on"] = "off"
    summary_token_threshold: int = 4000
    tenant_mode: bool = False
    jwt_secret: str | None = None
    rate_limit_rpm: int = 60
    rag_backend: Literal["ragflow"] = "ragflow"
    ragflow_base_url: str = "http://localhost"
    ragflow_api_key: str | None = None
    ragflow_top_k: int = 5
    # Comma-separated RAGFlow dataset (knowledge base) IDs used when the client omits dataset_ids
    ragflow_default_dataset_ids: str = ""
    admin_api_key: str | None = None
    web_search_enabled: bool = False
    searxng_base_url: str = "http://localhost:8080"
    web_search_top_k: int = 5
    web_search_intent_mode: Literal["llm", "heuristic"] = "llm"

@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_ragflow_default_dataset_ids() -> list[str]:
    raw = get_settings().ragflow_default_dataset_ids
    if not raw.strip():
        return []
    return [part.strip() for part in raw.split(",") if part.strip()]
