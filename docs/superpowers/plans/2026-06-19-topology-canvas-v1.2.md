# Topology Canvas v1.2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Ship Topology Canvas v1.2 — per-workspace ops config bootstrap, read-only graph, Logs tab with one-shot snapshot + local ops-logs history.

**Architecture:** Electron main `ensureWorkspaceOpsConfig` writes `.agentflow/topology.yaml` + `ops.yaml` on first Canvas enter; agent server exposes `/v1/workspace/ops/*`; Vue Topology page renders graph + Node Drawer (Logs default).

**Tech Stack:** TypeScript, Vue 3, yaml, Vitest; system `ssh` for log snapshot (no ssh2 dep yet).

**Spec:** `docs/superpowers/specs/2026-06-19-topology-canvas-ops-design.md`

---

### Task 1: Ops types + default templates

**Files:**
- Create: `desktop/electron/resources/opsTypes.ts`
- Create: `desktop/tests/resources/opsTypes.test.ts`

- [ ] Define `OpsConfig`, `NodeAccess`, `WorkspaceOpsBundle`, default YAML serializers

---

### Task 2: Compose import + bootstrap

**Files:**
- Create: `desktop/electron/resources/composeImport.ts`
- Create: `desktop/electron/resources/opsBootstrap.ts`
- Create: `desktop/tests/resources/composeImport.test.ts`
- Create: `desktop/tests/resources/opsBootstrap.test.ts`

- [ ] `importComposeToTopology(content, projectId)` — mirror resource-server adapter
- [ ] `ensureWorkspaceOpsConfig(root, getResourceServerUrl?)` — bootstrap order per spec §3.2
- [ ] Never overwrite existing files

---

### Task 3: Load/save workspace ops + agent routes

**Files:**
- Create: `desktop/electron/workspace/opsService.ts`
- Modify: `desktop/electron/agent/server.ts`
- Modify: `desktop/electron/resources/topology.ts` — extend `TopologyNode` with optional `access`

- [ ] `GET /v1/workspace/ops/bootstrap` — ensure + return bundle
- [ ] `GET /v1/workspace/ops` — load topology + ops
- [ ] `GET /v1/workspace/ops/logs?nodeId=` — list ops-logs for node

---

### Task 4: Log snapshot (non-follow)

**Files:**
- Create: `desktop/electron/resources/opsLogs.ts`
- Create: `desktop/tests/resources/opsLogs.test.ts`

- [ ] `fetchLogSnapshot` via system `ssh` when host configured
- [ ] Persist to `.agentflow/ops-logs/{nodeId}-logs-{iso}.log`
- [ ] Graceful error when host empty

---

### Task 5: Topology Canvas UI

**Files:**
- Create: `desktop/src/pages/TopologyCanvas.vue`
- Create: `desktop/src/components/topology/TopologyGraph.vue`
- Create: `desktop/src/components/topology/TopologyNodeDrawer.vue`
- Create: `desktop/src/composables/useTopologyOps.ts`
- Modify: `desktop/src/layouts/AppShell.vue`

- [ ] Nav entry **Topology**
- [ ] Bootstrap on mount; toast when files created
- [ ] Read-only graph; click node → Drawer Logs tab default
- [ ] Snapshot button + history list

---

### Task 6: Verification

- [ ] `cd desktop && pnpm test`
- [ ] Update spec status to Approved + v1.2 success criteria checkboxes
