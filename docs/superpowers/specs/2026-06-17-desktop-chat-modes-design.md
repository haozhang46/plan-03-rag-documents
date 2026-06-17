# Desktop Chat Modes (Ask / Plan / Agent) + Slash Skills — Design Spec

**Status:** Approved — 2026-06-17

## 1. Purpose

Extend **Agent Flow Desktop → Chat** with three chat modes and slash-triggered skill selection:

| Mode | Behavior |
|------|----------|
| **Ask** | Local sidecar LLM (DeepSeek), **no tools**, fast Q&A |
| **Plan** | Read-only exploration (read/list/git) + structured markdown plan; **Approve** handoff to Agent |
| **Agent** | Existing **general-react** ReAct with full tools |

**Slash skills:** Typing `/` in chat input opens skill picker; selected skills are **sticky per thread** (multi-select chips).

## 2. Decisions

| Topic | Choice |
|-------|--------|
| Mode vs skill | Orthogonal: mode selector + `/` for skills only |
| Ask LLM | DeepSeek via existing API key (no tools); v2 Ollama optional |
| Plan confirm | Inline **Approve / Edit / Cancel**; Approve → Agent + plan as context |
| Skill scope | Multi-select **sticky per thread** (chips above input) |
| Scope | **Chat page only** (v1); Workflow Run keeps existing skill pills |

## 3. API

### POST /v1/chat

```json
{
  "thread_id": "uuid",
  "message": "...",
  "mode": "ask" | "plan" | "agent",
  "skills": ["test-driven-development"]
}
```

Legacy `flow_id: "general-react"` maps to `mode: "agent"`.

Checkpoint keys: `{mode}:{threadId}`.

### GET /v1/skills

Returns `[{ "name", "description" }]` from `skills/registry.yaml`.

### SSE (Plan)

On `mode=plan` completion, emit `event: plan_ready` with `{ "content": "..." }` before `done`.

## 4. UI

```text
┌─────────────────────────────────────────────┐
│ [ Ask ] [ Plan ] [ Agent ]                  │
├─────────────────────────────────────────────┤
│ messages…                                   │
│ ┌ PlanApprovalCard ─ Approve Edit Cancel ┐  │  ← when plan_ready
├─────────────────────────────────────────────┤
│ Skills: [tdd ×] [brainstorming ×]           │
│ ┌ Chat input  /  opens skill menu      Send │
└─────────────────────────────────────────────┘
```

Thread meta in `localStorage`: `desktop:thread-meta:{id}` → `{ mode, skills[] }`.

## 5. System prompts

- **Ask:** concise assistant; skills appended if selected
- **Plan:** planning assistant; read-only tools; output markdown plan; skills appended
- **Agent:** AGENTS.md + skills + full tools

## 6. Out of scope (v1)

- Ollama local models
- Slash menu in Workflow Run step chat
- Skill registry git pull

## 7. Testing

- `agentService` mode tool sets (ask=0, plan=4, agent=5 tools)
- `/v1/chat` mode + skills body
- `ChatInputWithSlash` skill filter
- `Chat.vue` plan approval handoff
