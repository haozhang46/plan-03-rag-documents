# Desktop ReAct Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Electron desktop app with local LangGraph ReAct sidecar, DeepSeek API, and git/shell tools via local executor.

**Architecture:** Python sidecar (`LOCAL_MODE`) runs `general-react` ReAct graph; desktop tools proxy to Electron HTTP executor; renderer uses `packages/shared-ui`.

**Tech Stack:** LangGraph, FastAPI, DeepSeek (OpenAI-compatible), Electron, electron-vite, Vue 3, pnpm workspaces

**Spec:** `docs/superpowers/specs/2026-06-16-desktop-react-agent-design.md`

---

### Task 1: Backend — desktop tools + ReAct graph + local sidecar API

**Files:**
- Create: `backend/app/agent/tools/desktop/executor_client.py`, `tools.py`
- Create: `backend/app/agent/graphs/react_agent.py`
- Create: `backend/app/flows/builders/general_react.py`
- Create: `backend/app/desktop/app.py`, `backend/app/desktop/__init__.py`
- Modify: `backend/app/config.py`, `backend/app/agent/state.py`, `backend/app/flows/registry.py`, `backend/pyproject.toml`
- Test: `backend/tests/test_desktop_tools.py`, `backend/tests/test_react_graph.py`

- [ ] Add config: `local_mode`, `desktop_executor_url`, `workspace_root`, `react_max_iterations`
- [ ] Add `react_iteration`, `workspace_root` to AgentState
- [ ] Implement executor client + langchain tools
- [ ] Implement ReAct graph (agent ↔ ToolNode loop with max iterations)
- [ ] Register `general-react` flow
- [ ] Create LOCAL_MODE FastAPI app with `/v1/chat`, `/v1/health/deepseek`
- [ ] Tests pass: `pytest -v`

---

### Task 2: packages/shared-ui extraction

**Files:**
- Create: `packages/shared-ui/` with components + composables
- Modify: `fe/package.json`, root `pnpm-workspace.yaml`, `fe/pages/index.vue`, `fe/composables/useChat.ts`
- Test: `fe/` vitest still passes

- [ ] Extract `ChatMessage`, `ChatInput`, `useMessages`, `parseSseStream`, chat types
- [ ] Wire `fe/` to `@agent-flow/shared-ui`
- [ ] Run `pnpm test` in fe

---

### Task 3: Electron desktop app scaffold

**Files:**
- Create: `desktop/` (electron-vite, main, preload, renderer, executor)
- Create: root `pnpm-workspace.yaml` if missing

- [ ] electron main: spawn sidecar, executor server :17351
- [ ] executor: read_file, list_dir, git_status, git_diff, run_shell + path sandbox
- [ ] preload: settings/workspace IPC stubs
- [ ] renderer: Chat page using shared-ui + `useLocalChat`

---

### Task 4: Integration + verification

- [ ] Backend tests green
- [ ] fe tests green
- [ ] Document desktop dev in `desktop/README.md`
- [ ] Manual smoke checklist documented
