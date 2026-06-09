# Multi-Flow Agent Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register multiple LangGraph flows by `flow_id`, route chat requests to the correct graph with isolated checkpoints, and support explicit `skill_names` override per request.

**Architecture:** `backend/app/flows/` holds `FlowSpec` + `GraphRegistry` that pre-compiles builders at startup into `app.state.graphs`. Chat API resolves `flow_id`, composes checkpoint key `{flow_id}:{thread_id}`, and passes `skill_names` / flow defaults into state for `prepare_node`. `fe/` debug console adds flow and skill selectors.

**Tech Stack:** Python 3.11, FastAPI, LangGraph, pytest; Nuxt 3, Vitest

**Spec:** `docs/superpowers/specs/2026-06-02-multi-flow-agent-platform-design.md`

---

### Task 1: Flow registry module

**Files:**
- Create: `backend/app/flows/specs.py`, `registry.py`, `builders/*.py`, `__init__.py`
- Modify: `backend/app/agent/graph.py` (export builders, keep `build_graph`)
- Test: `backend/tests/test_flow_registry.py`

- [ ] **Step 1:** Failing tests for `list_flows()`, `get_graph("supervisor")`, unknown id raises `KeyError`
- [ ] **Step 2:** Implement registry with 5 built-in flow_ids
- [ ] **Step 3:** pytest pass

---

### Task 2: Startup + chat routing

**Files:**
- Modify: `backend/app/main.py`, `backend/app/api/routes/chat.py`
- Test: `backend/tests/test_chat_flow_routing.py`

- [ ] **Step 1:** Failing test: chat with `flow_id=linear-rag` uses distinct graph; unknown → 400
- [ ] **Step 2:** `GraphRegistry.load_all` in lifespan; `app.state.graphs`; alias `app.state.graph`
- [ ] **Step 3:** `ChatRequest.flow_id`; checkpoint `f"{flow_id}:{thread_id}"`
- [ ] **Step 4:** pytest pass

---

### Task 3: GET /v1/flows

**Files:**
- Create: `backend/app/api/routes/flows.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_flows_api.py`

- [ ] **Step 1:** Failing test GET /v1/flows returns flow metadata
- [ ] **Step 2:** Implement route
- [ ] **Step 3:** pytest pass

---

### Task 4: Skill resolution

**Files:**
- Create: `backend/app/skills/resolve.py`
- Modify: `backend/app/agent/nodes/prepare.py`, `chat.py` route `_build_input`
- Test: `backend/tests/test_skill_resolution.py`

- [ ] **Step 1:** Tests: request skill_names overrides; flow defaults; auto-router fallback
- [ ] **Step 2:** Implement `resolve_skill_names(request, flow_spec, message)`
- [ ] **Step 3:** Validate unknown names → 400 on chat
- [ ] **Step 4:** pytest pass

---

### Task 5: Debug console (fe)

**Files:**
- Create: `fe/composables/useFlows.ts`, `fe/composables/useSkills.ts`, `fe/components/DebugToolbar.vue`
- Modify: `fe/composables/useChat.ts`, `fe/pages/index.vue`, `fe/types/index.ts`
- Test: `fe/tests/useFlows.test.ts`

- [ ] **Step 1:** useFlows + useSkills composables
- [ ] **Step 2:** Toolbar with flow select + skills multi-select
- [ ] **Step 3:** useChat sends flow_id + skill_names

---

### Task 6: Docs

**Files:**
- Modify: `backend/README.md`, spec status → Approved

- [ ] **Step 1:** External integration section with curl examples
