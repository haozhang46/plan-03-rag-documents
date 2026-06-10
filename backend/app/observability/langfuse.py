from langfuse import Langfuse
from app.config import get_settings


def get_langfuse_client() -> Langfuse | None:
    s = get_settings()
    if not s.langfuse_enabled:
        return None
    return Langfuse(
        public_key=s.langfuse_public_key,
        secret_key=s.langfuse_secret_key,
        host=s.langfuse_host,
    )
