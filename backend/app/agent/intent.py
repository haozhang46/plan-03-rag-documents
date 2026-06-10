from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.models.intent import WebSearchIntentOutput
from app.config import get_settings
from app.llm.factory import get_chat_model
from app.observability.langfuse import get_langfuse_client

_WEB_SEARCH_KEYWORDS = (
    "最新",
    "今天",
    "昨天",
    "新闻",
    "价格",
    "股价",
    "天气",
    "现在",
    "目前",
    "实时",
    "发布",
    "什么时候",
    "几点",
    "网上",
    "搜索一下",
    "查一下",
    "latest",
    "today",
    "yesterday",
    "news",
    "price",
    "weather",
    "current",
    "release",
    "when did",
    "look up",
    "web search",
    "online",
)

_INTENT_SYSTEM_PROMPT = (
    "You decide whether a public web search should run before answering.\n"
    "Say use_web_search=true when correctness depends on current or "
    "time-sensitive information: news, prices, weather, product releases, "
    "schedules, live status, recent events, or facts that change over time.\n"
    "Say use_web_search=false for evergreen definitions, coding help without "
    "live data, general conversation, math, opinions, or questions that "
    "uploaded documents alone should answer.\n"
    "When unsure, prefer false to avoid unnecessary searches."
)


def needs_web_search_heuristic(message: str) -> bool:
    text = message.lower()
    return any(k in text for k in _WEB_SEARCH_KEYWORDS)


def _classify_with_llm(message: str) -> tuple[bool, str]:
    llm = get_chat_model()
    structured = llm.with_structured_output(WebSearchIntentOutput)
    result: WebSearchIntentOutput = structured.invoke(
        [
            SystemMessage(content=_INTENT_SYSTEM_PROMPT),
            HumanMessage(content=message),
        ]
    )
    return result.use_web_search, result.reasoning


def classify_web_search_intent(message: str) -> tuple[bool, str]:
    settings = get_settings()
    if settings.web_search_intent_mode == "heuristic":
        use = needs_web_search_heuristic(message)
        return use, f"heuristic={use}"

    client = get_langfuse_client()

    def _run() -> tuple[bool, str]:
        try:
            return _classify_with_llm(message)
        except Exception as exc:
            use = needs_web_search_heuristic(message)
            return use, f"fallback ({exc.__class__.__name__}): heuristic={use}"

    if not client:
        return _run()

    with client.start_as_current_observation(name="intent.web_search") as span:
        use, reason = _run()
        span.update(metadata={"use_web_search": use, "web_search_reason": reason})
        return use, reason
