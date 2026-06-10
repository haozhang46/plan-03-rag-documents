from langchain_anthropic import ChatAnthropic
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI

from app.config import get_settings


def get_chat_model(
    provider: str | None = None, model: str | None = None
) -> BaseChatModel:
    settings = get_settings()
    provider = provider or settings.default_llm_provider
    model = model or settings.default_model

    if provider == "openai":
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY not set")
        return ChatOpenAI(
            model=model, api_key=settings.openai_api_key, streaming=True
        )
    if provider == "anthropic":
        if not settings.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        return ChatAnthropic(
            model=model, api_key=settings.anthropic_api_key, streaming=True
        )
    if provider == "deepseek":
        if not settings.deepseek_api_key:
            raise ValueError("DEEPSEEK_API_KEY not set")
        return ChatOpenAI(
            model=model,
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
            streaming=True,
        )
    raise ValueError(f"Unknown provider: {provider}")
