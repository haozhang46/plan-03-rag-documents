# DeepSeek LLM Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add DeepSeek as a third chat LLM provider selectable via `DEFAULT_LLM_PROVIDER=deepseek`, using DeepSeek's OpenAI-compatible API—no new LangChain package required.

**Architecture:** Extend `Settings` with `deepseek_api_key` and optional `deepseek_base_url`; add a `deepseek` branch in `get_chat_model()` that returns `ChatOpenAI` pointed at `https://api.deepseek.com/v1`. RAG embeddings stay on OpenAI (`embedding_provider` unchanged). Chat graph and SSE routes need no changes—they already call `get_chat_model()`.

**Tech Stack:** Python 3.11, existing `langchain-openai` (`ChatOpenAI` + custom `base_url`), pydantic-settings, pytest

**Depends on:** Plan 01 (`app/llm/factory.py`) | **Blocks:** none

---

## Prerequisites

From repo root, backend tests must be green:

```bash
cd backend && source .venv/bin/activate
pytest -v
```

**Working directory for commands below:** `backend/` (venv active).

**DeepSeek API reference:**
- Base URL: `https://api.deepseek.com/v1`
- Chat models: `deepseek-chat` (default), `deepseek-reasoner`
- Auth header: `Authorization: Bearer <DEEPSEEK_API_KEY>`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/app/config.py` | Modify | `deepseek_api_key`, `deepseek_base_url` |
| `.env.example` | Modify | Document DeepSeek env vars |
| `backend/app/llm/factory.py` | Modify | `provider == "deepseek"` branch |
| `backend/tests/test_llm_factory.py` | Modify | DeepSeek factory tests |
| `backend/tests/test_config.py` | Modify | Assert DeepSeek defaults |
| `backend/README.md` | Modify | Provider table + example `.env` |
| `AGENTS.md` | Modify | Stack line mentions DeepSeek |

**Out of scope (YAGNI):**
- DeepSeek embeddings for RAG (keep `OPENAI_API_KEY` for `DocumentStore`)
- Per-request provider override in `ChatRequest` (env-only for V1)
- New `langchain-deepseek` dependency

---

### Task 1: Settings and `.env.example`

**Files:**
- Modify: `backend/app/config.py`
- Modify: `.env.example`
- Test: `backend/tests/test_config.py`

- [ ] **Step 1: Write failing config test**

Append to `backend/tests/test_config.py`:

```python
def test_settings_deepseek_defaults():
    s = Settings(
        _env_file=None,
        openai_api_key=None,
        anthropic_api_key=None,
    )
    assert s.deepseek_base_url == "https://api.deepseek.com/v1"
    assert s.default_llm_provider == "openai"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_config.py::test_settings_deepseek_defaults -v
```

Expected: FAIL with `Settings` has no attribute `deepseek_base_url`

- [ ] **Step 3: Add DeepSeek fields to Settings**

In `backend/app/config.py`, add after `anthropic_api_key`:

```python
    deepseek_api_key: str | None = None
    deepseek_base_url: str = "https://api.deepseek.com/v1"
```

Pydantic-settings auto-maps env `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`.

- [ ] **Step 4: Update `.env.example`**

Append after `ANTHROPIC_API_KEY`:

```env
DEEPSEEK_API_KEY=sk-...
# DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
# DEFAULT_LLM_PROVIDER=deepseek
# DEFAULT_MODEL=deepseek-chat
```

- [ ] **Step 5: Run config tests**

Run:

```bash
pytest tests/test_config.py -v
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/app/config.py backend/tests/test_config.py .env.example
git commit -m "feat: add DeepSeek API settings"
```

---

### Task 2: `get_chat_model` DeepSeek branch

**Files:**
- Modify: `backend/app/llm/factory.py`
- Test: `backend/tests/test_llm_factory.py`

- [ ] **Step 1: Write failing factory test**

Append to `backend/tests/test_llm_factory.py`:

```python
def test_get_chat_model_deepseek(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("DEEPSEEK_API_KEY", "test-deepseek-key")
    monkeypatch.setenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
    get_settings.cache_clear()

    model = get_chat_model("deepseek", "deepseek-chat")
    assert model.model_name == "deepseek-chat"
    assert str(model.openai_api_base) == "https://api.deepseek.com/v1"
    assert model.openai_api_key.get_secret_value() == "test-deepseek-key"


def test_get_chat_model_deepseek_missing_key(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    get_settings.cache_clear()

    with pytest.raises(ValueError, match="DEEPSEEK_API_KEY not set"):
        get_chat_model("deepseek", "deepseek-chat")
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pytest tests/test_llm_factory.py::test_get_chat_model_deepseek tests/test_llm_factory.py::test_get_chat_model_deepseek_missing_key -v
```

Expected: FAIL (`Unknown provider: deepseek` or attribute errors)

- [ ] **Step 3: Implement DeepSeek branch**

Replace `backend/app/llm/factory.py` with:

```python
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
```

- [ ] **Step 4: Run factory tests**

Run:

```bash
pytest tests/test_llm_factory.py -v
```

Expected: all PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/app/llm/factory.py backend/tests/test_llm_factory.py
git commit -m "feat: add DeepSeek chat provider via OpenAI-compatible API"
```

---

### Task 3: Documentation and manual smoke test

**Files:**
- Modify: `backend/README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Update `backend/README.md` Chat API section**

Add after existing curl example:

````markdown
### DeepSeek

```env
DEEPSEEK_API_KEY=sk-...
DEFAULT_LLM_PROVIDER=deepseek
DEFAULT_MODEL=deepseek-chat
```

Models: `deepseek-chat` (general), `deepseek-reasoner` (reasoning). RAG embeddings still require `OPENAI_API_KEY`.
````

- [ ] **Step 2: Update `AGENTS.md` Stack line**

Change LLM bullet to:

```markdown
- **LLM:** LangChain（OpenAI / Anthropic / DeepSeek，经 `app/llm/factory.py`）
```

- [ ] **Step 3: Run full test suite**

Run:

```bash
pytest -v
```

Expected: all tests PASS

- [ ] **Step 4: Manual smoke (optional, requires real key)**

```bash
export DEEPSEEK_API_KEY=sk-...
export DEFAULT_LLM_PROVIDER=deepseek
export DEFAULT_MODEL=deepseek-chat
uvicorn app.main:app --reload
curl -N -X POST http://localhost:8000/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"thread_id":"deepseek-test","message":"say hi in one word"}'
```

Expected: SSE stream with AI reply

- [ ] **Step 5: Commit**

```bash
git add backend/README.md AGENTS.md
git commit -m "docs: document DeepSeek LLM provider configuration"
```

---

## Spec Coverage

| Requirement | Task |
|-------------|------|
| PRD §5 多模型可切换 | Task 2 `deepseek` provider |
| 不破坏 OpenAI / Anthropic | Task 2 keeps existing branches |
| env 驱动切换 | Task 1 `DEFAULT_LLM_PROVIDER` + keys |
| 流式 SSE 对话 | 无代码变更（`chat_node` 已 `streaming=True`） |
| RAG embedding 独立 | 明确 out of scope |

## Self-Review Notes (applied)

- **No new dependency:** DeepSeek exposes OpenAI-compatible REST; `ChatOpenAI(base_url=...)` is sufficient.
- **Attribute names:** Tests use `model.openai_api_base` / `openai_api_key` as exposed by langchain-openai `ChatOpenAI`—if a version rename occurs, assert on `model.root_client.base_url` instead.
- **Reasoning model:** `deepseek-reasoner` may stream `reasoning_content` chunks; V1 uses same `chat_node`—no special handling unless product asks later.

## Deferred

- DeepSeek embeddings for `DocumentStore`
- `ChatRequest.provider` per-request override
- Langfuse model name tagging for DeepSeek traces
