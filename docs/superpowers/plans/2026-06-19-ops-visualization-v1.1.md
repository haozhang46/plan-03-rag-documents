# Ops Visualization Integration — Implementation Plan (v1.1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Integrate external ops visualization (Portainer for Docker VPS, Meshery for Kubernetes) via Resource Server read-only adapters; show runtime summary in Desktop CicdPanel; link to external panels from Settings.

**Architecture:** Resource Server env-configured `PORTAINER_*` and `MESHERY_*`; new `GET /v1/ops/config` (public URLs) and `GET /v1/ops/summary?project=` (aggregated runtime). Desktop fetches through existing agent server proxy. Self-built `/ui` remains dev-only editor, not primary ops panel.

**Spec addendum:** `docs/superpowers/specs/2026-06-19-topology-resource-server-design.md` §13

**Prerequisite:** Complete uncommitted Chat topology tools (Option B) from v1 follow-up.

---

### Task 1: Spec addendum §13 Ops Visualization

**Files:** `docs/superpowers/specs/2026-06-19-topology-resource-server-design.md`

- [ ] Add §13 describing Portainer + Meshery integration, deprecating `/ui` as primary ops panel
- [ ] Add v1.1 success criteria checklist

---

### Task 2: Resource Server ops config + models

**Files:**
- Modify: `resource-server/app/config.py`
- Create: `resource-server/app/models/ops.py`

- [ ] Add `portainer_url`, `portainer_api_token`, `meshery_url` to Settings
- [ ] Pydantic models: `OpsConfig`, `DockerOpsSummary`, `KubernetesOpsSummary`, `OpsSummary`

---

### Task 3: Portainer adapter

**Files:**
- Create: `resource-server/app/adapters/portainer.py`
- Create: `resource-server/tests/test_portainer_adapter.py`

- [ ] `fetch_portainer_summary(url, token) -> DockerOpsSummary | None`
- [ ] Graceful fallback when unconfigured or unreachable
- [ ] Tests with mocked httpx responses

---

### Task 4: Meshery adapter + ops routes

**Files:**
- Create: `resource-server/app/adapters/meshery.py`
- Create: `resource-server/app/api/routes/ops.py`
- Create: `resource-server/tests/test_ops_routes.py`
- Modify: `resource-server/app/main.py`

- [ ] `fetch_meshery_summary(url) -> KubernetesOpsSummary | None`
- [ ] `GET /v1/ops/config` — `{ portainerUrl?, mesheryUrl? }`
- [ ] `GET /v1/ops/summary?project=` — merged docker + k8s + intent topology node count
- [ ] Wire router in main.py

---

### Task 5: Desktop ops client + agent proxy

**Files:**
- Create: `desktop/electron/resources/opsClient.ts`
- Modify: `desktop/electron/agent/server.ts`
- Modify: `desktop/electron/workspace/service.ts`
- Modify: `desktop/src/composables/useWorkflow.ts`
- Create: `desktop/tests/resources/opsClient.test.ts`

- [ ] Fetch `/v1/ops/config` and `/v1/ops/summary?project=` from Resource Server
- [ ] Agent routes: `GET /v1/ops/config`, `GET /v1/ops/summary`
- [ ] Expose via useWorkflow

---

### Task 6: CicdPanel + Settings ops links

**Files:**
- Modify: `desktop/src/components/workflow/WorkflowCicdPanel.vue`
- Modify: `desktop/src/pages/Settings.vue`

- [ ] CicdPanel section "Runtime Ops" with Docker VPS / K8s cards
- [ ] Settings buttons: Open Portainer, Open Meshery (when configured on server)
- [ ] Note that ops URLs are configured on Resource Server `.env`

---

### Task 7: Chat topology tools (Option B WIP)

**Files:** (already partially written on main)
- `desktop/electron/agent/topologyTools.ts`
- `desktop/electron/resources/topologyClient.ts`
- Modified agent wiring + tests
- `resource-server/ui/index.html` validation fix

- [ ] Ensure all topology tools wired when Resource Server URL set
- [ ] Tests pass

---

### Task 8: Verification

- [ ] `cd resource-server && pytest -v`
- [ ] `cd desktop && pnpm test`
- [ ] Mark spec §13 success criteria complete
