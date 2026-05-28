# Skills Registry and L1/L2 Progressive Disclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `skills/registry.yaml` + `SKILL.md` files, L1 metadata always available, L2 body injected on intent match, `instruction`/`workflow`/`resource` typing, and a LangGraph `prepare` node that merges skill snippets before the LLM `chat` node.

**Architecture:** `SkillRegistry` loads L1 from YAML; `SkillRouter` selects skills via keyword/trigger matching (V1, no embeddings); `load_l2` strips SKILL frontmatter; `prepare_node` appends a `SystemMessage` wrapped in `<skills>`. Graph becomes `START → prepare → chat → END`. `workflow` skills only set `spawn_subagent: true` in metadata—V1 does not Handoff (Plan 06).

**Tech Stack:** Python 3.11, PyYAML, Pydantic, LangGraph, langchain-core messages, pytest (existing `backend/` from Plan 01)

**Depends on:** Plan 01 (`backend/app/agent/graph.py`, `chat_node`, `AgentState`) | **Blocks:** Plan 06 (L3, embeddings, workflow Handoff)

---

## Prerequisites

From repo root, Plan 01 must be green:

```bash
cd backend && source .venv/bin/activate
pytest -v
```

**Working directory for all commands below:** `backend/` (with venv active).

**Path convention:** `skills_root` points at the repo folder `skills/` (not the monorepo root). Each `SkillMeta.path` is relative to that folder, e.g. `test-driven-development/SKILL.md`.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `skills/registry.yaml` | Create | L1 index: name, description, type, triggers, path |
| `skills/test-driven-development/SKILL.md` | Create | Example L2 skill body + frontmatter |
| `skills/subagent-driven-development/SKILL.md` | Create | Example `workflow` skill (metadata only in V1) |
| `backend/app/skills/__init__.py` | Create | Package marker |
| `backend/app/skills/models.py` | Create | `SkillType`, `SkillMeta` |
| `backend/app/skills/registry.py` | Create | `SkillRegistry.list_l1()` |
| `backend/app/skills/loader.py` | Create | `load_l2(path)` strips YAML frontmatter |
| `backend/app/skills/router.py` | Create | `SkillRouter.select(message)` |
| `backend/app/config.py` | Modify | `skills_root` + env `SKILLS_ROOT` |
| `backend/app/agent/nodes/prepare.py` | Create | Inject skill `SystemMessage` |
| `backend/app/agent/graph.py` | Modify | Wire `prepare` before `chat` |
| `backend/pyproject.toml` | Modify | Add `pyyaml`, register `app.skills` package |
| `backend/tests/conftest.py` | Modify | `skills_fixture` helper for isolated registry |
| `backend/tests/test_skill_models.py` | Create | Model parsing |
| `backend/tests/test_skill_registry.py` | Create | L1 load |
| `backend/tests/test_skill_loader.py` | Create | L2 strip frontmatter |
| `backend/tests/test_skill_router.py` | Create | Keyword/trigger routing |
| `backend/tests/test_prepare_node.py` | Create | Node injects `<skills>` |
| `backend/tests/test_graph.py` | Modify | Expect extra message when skills match |

---

### Task 1: Dependencies, models, and repo skill fixtures

**Files:**
- Modify: `backend/pyproject.toml`
- Create: `backend/app/skills/__init__.py`
- Create: `backend/app/skills/models.py`
- Create: `skills/registry.yaml`
- Create: `skills/test-driven-development/SKILL.md`
- Create: `skills/subagent-driven-development/SKILL.md`
- Test: `backend/tests/test_skill_models.py`

- [ ] **Step 1: Add PyYAML dependency**

In `backend/pyproject.toml`, add to `dependencies`:

```toml
  "pyyaml>=6.0.0",
```

Under `[tool.setuptools] packages`, add `"app.skills"`:

```toml
packages = ["app", "app.agent", "app.agent.nodes", "app.api", "app.api.routes", "app.llm", "app.skills"]
```

- [ ] **Step 2: Reinstall editable package**

Run:

```bash
cd backend && pip install -e ".[dev]"
```

Expected: installs `pyyaml` without error.

- [ ] **Step 3: Write failing model test**

Create `backend/tests/test_skill_models.py`:

```python
from app.skills.models import SkillMeta, SkillType


def test_skill_meta_parses_registry_row():
    meta = SkillMeta(
        name="test-driven-development",
        description="Use when implementing features",
        skill_type=SkillType.instruction,
        spawn_subagent=False,
        path="test-driven-development/SKILL.md",
        triggers=["tdd"],
    )
    assert meta.skill_type == SkillType.instruction
    assert meta.triggers == ["tdd"]
```

- [ ] **Step 4: Run test to verify it fails**

Run:

```bash
pytest tests/test_skill_models.py::test_skill_meta_parses_registry_row -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'app.skills'`

- [ ] **Step 5: Implement models**

Create `backend/app/skills/__init__.py` (empty file).

Create `backend/app/skills/models.py`:

```python
from enum import Enum

from pydantic import BaseModel, Field


class SkillType(str, Enum):
    instruction = "instruction"
    workflow = "workflow"
    resource = "resource"


class SkillMeta(BaseModel):
    name: str
    description: str
    skill_type: SkillType = SkillType.instruction
    spawn_subagent: bool = False
    path: str
    triggers: list[str] = Field(default_factory=list)
```

- [ ] **Step 6: Run test to verify it passes**

Run:

```bash
pytest tests/test_skill_models.py -v
```

Expected: PASS

- [ ] **Step 7: Add repo skill fixtures**

Create `skills/registry.yaml`:

```yaml
skills:
  - name: test-driven-development
    description: Use when implementing features; follow red-green-refactor
    skill_type: instruction
    spawn_subagent: false
    path: test-driven-development/SKILL.md
    triggers:
      - tdd
      - test-driven
  - name: subagent-driven-development
    description: Use when executing multi-step implementation plans with review gates
    skill_type: workflow
    spawn_subagent: true
    path: subagent-driven-development/SKILL.md
    triggers:
      - subagent
```

Create `skills/test-driven-development/SKILL.md`:

```markdown
---
name: test-driven-development
skill_type: instruction
---
# TDD

1. Write failing test
2. Implement minimal code
3. Refactor
```

Create `skills/subagent-driven-development/SKILL.md`:

```markdown
---
name: subagent-driven-development
skill_type: workflow
spawn_subagent: true
---
# Subagent-driven development

V1: metadata only. Plan 06 will spawn subgraphs when `spawn_subagent` is true.
```

- [ ] **Step 8: Commit**

```bash
git add backend/pyproject.toml backend/app/skills backend/tests/test_skill_models.py skills/
git commit -m "feat: skill models and registry fixtures"
```

---

### Task 2: Settings `skills_root` and L1 registry loader

**Files:**
- Modify: `backend/app/config.py`
- Create: `backend/app/skills/registry.py`
- Modify: `backend/tests/conftest.py`
- Test: `backend/tests/test_config.py`
- Test: `backend/tests/test_skill_registry.py`

- [ ] **Step 1: Write failing config test**

Append to `backend/tests/test_config.py`:

```python
from pathlib import Path


def test_settings_skills_root_points_at_repo_skills():
    s = Settings(_env_file=None, openai_api_key=None, anthropic_api_key=None)
    root = Path(s.skills_root)
    assert root.name == "skills"
    assert (root / "registry.yaml").is_file()
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_config.py::test_settings_skills_root_points_at_repo_skills -v
```

Expected: FAIL (`Settings` has no attribute `skills_root`)

- [ ] **Step 3: Add `skills_root` to Settings**

At top of `backend/app/config.py` add:

```python
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_SKILLS_ROOT = _REPO_ROOT / "skills"
```

Add field to `Settings`:

```python
    skills_root: str = str(_DEFAULT_SKILLS_ROOT)
```

Pydantic-settings reads env `SKILLS_ROOT` automatically (field name uppercased).

- [ ] **Step 4: Run config test**

Run:

```bash
pytest tests/test_config.py -v
```

Expected: PASS

- [ ] **Step 5: Add skills fixture helper to conftest**

Append to `backend/tests/conftest.py`:

```python
import shutil
from pathlib import Path


@pytest.fixture
def skills_fixture(tmp_path, monkeypatch):
    """Copy repo skills/ into tmp_path/skills and point SKILLS_ROOT there."""
    repo_skills = Path(__file__).resolve().parents[2] / "skills"
    dest = tmp_path / "skills"
    shutil.copytree(repo_skills, dest)
    monkeypatch.setenv("SKILLS_ROOT", str(dest))
    get_settings.cache_clear()
    yield dest
    get_settings.cache_clear()
```

Add import at top of `conftest.py`:

```python
from app.config import get_settings
```

- [ ] **Step 6: Write failing registry test**

Create `backend/tests/test_skill_registry.py`:

```python
from app.skills.registry import SkillRegistry
from app.skills.models import SkillType


def test_load_l1_returns_all_skills(skills_fixture):
    reg = SkillRegistry(root=skills_fixture)
    items = reg.list_l1()
    assert len(items) == 2
    names = {m.name for m in items}
    assert "test-driven-development" in names
    tdd = next(m for m in items if m.name == "test-driven-development")
    assert tdd.skill_type == SkillType.instruction
    assert "tdd" in tdd.triggers


def test_load_l1_workflow_has_spawn_flag(skills_fixture):
    reg = SkillRegistry(root=skills_fixture)
    workflow = next(m for m in reg.list_l1() if m.name == "subagent-driven-development")
    assert workflow.skill_type == SkillType.workflow
    assert workflow.spawn_subagent is True
```

- [ ] **Step 7: Run test to verify it fails**

Run:

```bash
pytest tests/test_skill_registry.py -v
```

Expected: FAIL `ModuleNotFoundError: app.skills.registry`

- [ ] **Step 8: Implement SkillRegistry**

Create `backend/app/skills/registry.py`:

```python
from pathlib import Path

import yaml

from app.config import get_settings
from app.skills.models import SkillMeta


class SkillRegistry:
    def __init__(self, root: Path | None = None):
        self.root = Path(root) if root is not None else Path(get_settings().skills_root)

    def list_l1(self) -> list[SkillMeta]:
        registry_path = self.root / "registry.yaml"
        data = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
        return [SkillMeta(**row) for row in data["skills"]]
```

- [ ] **Step 9: Run registry tests**

Run:

```bash
pytest tests/test_skill_registry.py -v
```

Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add backend/app/config.py backend/app/skills/registry.py backend/tests/conftest.py backend/tests/test_config.py backend/tests/test_skill_registry.py
git commit -m "feat: load L1 skill metadata from registry.yaml"
```

---

### Task 3: L2 loader (strip frontmatter)

**Files:**
- Create: `backend/app/skills/loader.py`
- Test: `backend/tests/test_skill_loader.py`

- [ ] **Step 1: Write failing loader test**

Create `backend/tests/test_skill_loader.py`:

```python
from pathlib import Path

from app.skills.loader import load_l2


def test_load_l2_strips_frontmatter(skills_fixture):
    path = skills_fixture / "test-driven-development" / "SKILL.md"
    body = load_l2(path)
    assert body.startswith("# TDD")
    assert "---" not in body.splitlines()[0]
    assert "Write failing test" in body
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_skill_loader.py::test_load_l2_strips_frontmatter -v
```

Expected: FAIL `ModuleNotFoundError: app.skills.loader`

- [ ] **Step 3: Implement loader**

Create `backend/app/skills/loader.py`:

```python
import re
from pathlib import Path

_FRONTMATTER = re.compile(r"^---\s*\n.*?\n---\s*\n", re.DOTALL)


def load_l2(skill_path: Path) -> str:
    text = skill_path.read_text(encoding="utf-8")
    return _FRONTMATTER.sub("", text).strip()
```

- [ ] **Step 4: Run loader test**

Run:

```bash
pytest tests/test_skill_loader.py -v
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/skills/loader.py backend/tests/test_skill_loader.py
git commit -m "feat: load L2 skill body without frontmatter"
```

---

### Task 4: Keyword and trigger router

**Files:**
- Create: `backend/app/skills/router.py`
- Test: `backend/tests/test_skill_router.py`

- [ ] **Step 1: Write failing router tests**

Create `backend/tests/test_skill_router.py`:

```python
from app.skills.registry import SkillRegistry
from app.skills.router import SkillRouter


def test_select_hits_tdd_by_trigger(skills_fixture):
    router = SkillRouter(registry=SkillRegistry(root=skills_fixture))
    hits = router.select("please use tdd for this feature")
    assert len(hits) == 1
    assert hits[0].name == "test-driven-development"


def test_select_hits_by_name_token(skills_fixture):
    router = SkillRouter(registry=SkillRegistry(root=skills_fixture))
    hits = router.select("follow test driven development")
    assert any(h.name == "test-driven-development" for h in hits)


def test_select_empty_when_no_match(skills_fixture):
    router = SkillRouter(registry=SkillRegistry(root=skills_fixture))
    assert router.select("hello world") == []


def test_select_respects_max_skills(skills_fixture):
    router = SkillRouter(registry=SkillRegistry(root=skills_fixture))
    hits = router.select("tdd and subagent plan", max_skills=1)
    assert len(hits) == 1
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pytest tests/test_skill_router.py -v
```

Expected: FAIL `ModuleNotFoundError: app.skills.router`

- [ ] **Step 3: Implement router**

Create `backend/app/skills/router.py`:

```python
from app.skills.models import SkillMeta
from app.skills.registry import SkillRegistry


class SkillRouter:
    def __init__(self, registry: SkillRegistry | None = None):
        self.registry = registry or SkillRegistry()

    def select(self, user_message: str, max_skills: int = 2) -> list[SkillMeta]:
        msg = user_message.lower()
        hits: list[SkillMeta] = []
        for meta in self.registry.list_l1():
            if self._matches(meta, msg):
                hits.append(meta)
        return hits[:max_skills]

    def _matches(self, meta: SkillMeta, msg: str) -> bool:
        for trigger in meta.triggers:
            if trigger.lower() in msg:
                return True
        slug = meta.name.replace("-", " ")
        if slug in msg:
            return True
        tokens = [t for t in meta.name.replace("-", " ").split() if len(t) > 3]
        return any(t in msg for t in tokens)
```

- [ ] **Step 4: Run router tests**

Run:

```bash
pytest tests/test_skill_router.py -v
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/skills/router.py backend/tests/test_skill_router.py
git commit -m "feat: keyword trigger skill router"
```

---

### Task 5: `prepare_node` and graph wiring

**Files:**
- Create: `backend/app/agent/nodes/prepare.py`
- Modify: `backend/app/agent/graph.py`
- Test: `backend/tests/test_prepare_node.py`
- Modify: `backend/tests/test_graph.py`

- [ ] **Step 1: Write failing prepare_node test**

Create `backend/tests/test_prepare_node.py`:

```python
from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.nodes.prepare import prepare_node


def test_prepare_injects_skills_system_message(skills_fixture, monkeypatch):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()

    state = {"messages": [HumanMessage(content="use tdd here")]}
    out = prepare_node(state)
    assert "messages" in out
    sys_msg = out["messages"][0]
    assert isinstance(sys_msg, SystemMessage)
    assert "<skills>" in sys_msg.content
    assert "test-driven-development" in sys_msg.content
    assert "# TDD" in sys_msg.content


def test_prepare_noop_when_no_match(skills_fixture, monkeypatch):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()

    state = {"messages": [HumanMessage(content="hello")]}
    assert prepare_node(state) == {}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_prepare_node.py -v
```

Expected: FAIL `ModuleNotFoundError: app.agent.nodes.prepare`

- [ ] **Step 3: Implement prepare_node**

Create `backend/app/agent/nodes/prepare.py`:

```python
from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.state import AgentState
from app.config import get_settings
from app.skills.loader import load_l2
from app.skills.router import SkillRouter


def prepare_node(state: AgentState) -> dict:
    last_human = next(
        m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)
    )
    router = SkillRouter()
    selected = router.select(last_human.content)
    if not selected:
        return {}
    root = Path(get_settings().skills_root)
    parts: list[str] = []
    for meta in selected:
        body = load_l2(root / meta.path)
        parts.append(f"## Skill: {meta.name}\n{body}")
    skill_prompt = "\n\n".join(parts)
    return {
        "messages": [
            SystemMessage(content=f"<skills>\n{skill_prompt}\n</skills>")
        ]
    }
```

- [ ] **Step 4: Run prepare_node tests**

Run:

```bash
pytest tests/test_prepare_node.py -v
```

Expected: PASS

- [ ] **Step 5: Wire graph**

Replace `backend/app/agent/graph.py` with:

```python
from langgraph.graph import END, START, StateGraph

from app.agent.nodes.chat import chat_node
from app.agent.nodes.prepare import prepare_node
from app.agent.state import AgentState


def build_graph(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("prepare", prepare_node)
    graph.add_node("chat", chat_node)
    graph.add_edge(START, "prepare")
    graph.add_edge("prepare", "chat")
    graph.add_edge("chat", END)
    return graph.compile(checkpointer=checkpointer)
```

- [ ] **Step 6: Update graph integration test**

In `backend/tests/test_graph.py`, add assertion that skill path adds a system message before AI reply:

```python
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

Replace `test_graph_invoke` body with:

```python
def test_graph_invoke(monkeypatch, skills_fixture):
    monkeypatch.setenv("SKILLS_ROOT", str(skills_fixture))
    from app.config import get_settings

    get_settings.cache_clear()
    monkeypatch.setattr("app.agent.nodes.chat.get_chat_model", lambda: FakeLLM())
    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t1"}}
    result = graph.invoke(
        {"messages": [HumanMessage(content="use tdd")]}, config
    )
    types = [type(m) for m in result["messages"]]
    assert SystemMessage in types
    assert AIMessage in types
    assert len(result["messages"]) >= 3
```

- [ ] **Step 7: Run full test suite**

Run:

```bash
pytest -v
```

Expected: all tests PASS (including existing `test_api_chat.py` with FakeLLM patches unchanged)

- [ ] **Step 8: Commit**

```bash
git add backend/app/agent/nodes/prepare.py backend/app/agent/graph.py backend/tests/test_prepare_node.py backend/tests/test_graph.py
git commit -m "feat: L1/L2 progressive skill disclosure in graph"
```

---

## Spec Coverage

| PRD §3.3 / §3.3.1 | Task |
|-------------------|------|
| L1 metadata (name + short description) | Task 2 `SkillRegistry` |
| L2 intent-triggered SKILL body | Task 3 `load_l2`, Task 5 `prepare_node` |
| `instruction` / `workflow` / `resource` types | Task 1 `SkillType` + registry rows |
| Load skill ≠ spawn subagent | `spawn_subagent` on `workflow` row only; no Handoff in V1 |
| `registry.yaml` example | Task 1 fixtures |
| Keyword routing (V1, not embedding) | Task 4 |
| Graph inject before LLM | Task 5 `prepare → chat` |

## Deferred to Plan 06

- L3 resource layer (file/retrieval, minimal context)
- Embedding-based semantic router
- `workflow` Handoff / `spawn_subagent` execution
- Langfuse `skill.load` vs `subgraph.invoke` events

## Self-Review Notes (applied)

- **Path fix:** `skills_root` = directory `skills/`; `path` in YAML is relative (`test-driven-development/SKILL.md`), not `skills/...` prefixed.
- **Router fix:** `triggers` in registry so `use tdd` matches (name-token-only router cannot match `tdd`).
- **Human message:** use `isinstance(m, HumanMessage)` (matches Plan 01 message types).
- **Config default:** resolved via `Path(__file__).parents[2] / "skills"` so tests work without Docker.
- **Packages:** `app.skills` added to setuptools for editable install.
