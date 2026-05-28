# Plan 07: V3 企业版（并行子图 / 多租户 / 技能市场）

> **For agentic workers:** REQUIRED SUB-SKILL: subagent-driven-development. 本计划 Task 粒度较粗，实施前可将每个 Task 再拆为 Plan 07 子文件。

**Goal:** 并行子任务、审核 Agent、技能权限与目录、多租户隔离、生产级部署与限流。

**Architecture:** LangGraph `Send` API 并行 fan-out；`tenant_id` 贯穿 Postgres RLS；技能市场为只读 git 子模块 + 管理 API。

**Depends on:** Plan 06

---

### Task 1: 并行子图（dispatching-parallel-agents）

**Files:** `backend/app/agent/graphs/parallel.py`

- [ ] 规划节点输出 `subtasks: list[{id, agent, prompt}]`，无依赖项 `Send` 并行

- [ ] 汇总节点 `reduce_results` 合并，冲突检测（同文件写）

- [ ] Langfuse parent span + child spans

- [ ] pytest：2 个子任务 mock 并行完成

- [ ] Commit: `feat: parallel subgraph dispatch`

---

### Task 2: 审核 / 质检 Agent

- [ ] `reviewer` 子图：对汇总结果做 spec checklist（JSON schema 输出 pass/fail）

- [ ] 失败 → 回 planner 带 `review_feedback`

- [ ] Commit

---

### Task 3: 多租户

**Files:** `backend/migrations/002_tenant.sql`, `backend/app/auth/tenant.py`

- [ ] 所有表加 `tenant_id`；RLS policy

- [ ] JWT claim `tenant_id`；middleware 注入

- [ ] 测试：租户 A 不可读租户 B 文档

- [ ] Commit

---

### Task 4: 技能权限与市场

- [ ] `skills/registry.yaml` 支持 `tenant_id` / `visibility: public|private`

- [ ] `GET /v1/skills` 列表；管理员 `POST /v1/skills` 注册

- [ ] 批量导入 zip

- [ ] Commit

---

### Task 5: 安全与限流

- [ ] `slowapi` 或 Redis 限流：每 tenant RPM

- [ ] 审计日志表 `audit_logs`

- [ ] 代码沙箱 seccomp / 网络隔离

- [ ] Commit

---

### Task 6: 生产部署

- [ ] `deploy/k8s/` Deployment + Ingress + Secret

- [ ] Helm values：replicas、resources、backup CronJob for Postgres

- [ ] README 运行手册

- [ ] Commit

---

## Spec Coverage (V3 PRD)

| PRD §6 V3 | Task |
|-----------|------|
| 并行子任务、流水线 | 1–2 |
| 技能市场、权限 | 4 |
| 多租户、审计、限流 | 3, 5 |
| Compose/K8s | 6 |
