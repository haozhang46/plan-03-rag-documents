# Plan 06: V2 Supervisor 多 Agent + L3 + 记忆

> **For agentic workers:** REQUIRED SUB-SKILL: subagent-driven-development (workflow 类 skill 会 spawn 子图).

**Goal:** LangGraph Supervisor 主图；规划 / RAG / 代码 专家子图；`workflow` skill 触发 Handoff；L3 资源加载；摘要记忆节点；多会话 API。

**Architecture:** `agent/graphs/supervisor.py` 为主入口；`create_react_agent` 或手写子图 per 专家；`Command`/`handoff` 回规划；子图 checkpoint 可选 `thread_id` 后缀。Map-Reduce 长文档子图挂 RAG 专家下。

**Tech Stack:** langgraph-supervisor 模式或官方 multi-agent 示例

**Depends on:** Plan 01–05

---

## File Map

| 文件 | 职责 |
|------|------|
| `backend/app/agent/graphs/supervisor.py` | 主图编译 |
| `backend/app/agent/graphs/planner.py` | 规划节点：拆任务、选 skill、路由 |
| `backend/app/agent/graphs/rag_agent.py` | 文档专家子图 |
| `backend/app/agent/graphs/code_agent.py` | 工具/沙箱专家子图 |
| `backend/app/agent/nodes/summarize.py` | 长对话摘要 |
| `backend/app/skills/loader.py` | L3 `load_l3_refs()` |
| `backend/app/api/routes/sessions.py` | 多会话 CRUD |

---

### Task 1: Supervisor 图骨架

- [ ] **Step 1: 失败测试** — `route_to_expert` 在消息含 "pdf" 时返回 `rag`

- [ ] **Step 2: planner_node 输出 `next_agent: Literal["rag","code","chat","END"]`**

```python
# 简化路由结构
class RouterOutput(BaseModel):
    next_agent: str
    reasoning: str
```

- [ ] **Step 3: 条件边 `planner` → 各子图或 END**

- [ ] **Step 4: Commit** — `feat: supervisor graph skeleton`

---

### Task 2: RAG 专家子图

- [ ] **Step 1:** 将 Plan 03 `rag_node` 逻辑迁入独立 `StateGraph`，工具：检索、引用格式化

- [ ] **Step 2:** Handoff 回 planner 时合并 `messages` 与 `citations`

- [ ] **Step 3: Langfuse span** `subgraph.invoke` name=`rag_agent`

- [ ] **Step 4: Commit**

---

### Task 3: Code 专家子图

- [ ] **Step 1:** 工具 `run_python`（受限 subprocess 或 docker sandbox）

- [ ] **Step 2:** 失败时返回 planner 重试（边 `code` → `planner`）

- [ ] **Step 3: Commit**

---

### Task 4: workflow Skill → Handoff

- [ ] **Step 1:** `registry.yaml` 增加 `subagent-driven-development`，`spawn_subagent: true`

- [ ] **Step 2:** planner 读 `SkillMeta.spawn_subagent`，为 true 时设置 `next_agent=implementer`（V2 可先映射到 `code`）

- [ ] **Step 3:** 子图 **不** 注入 `using-superpowers` 类 L1 列表，仅任务 L2（PRD §3.3.1）

- [ ] **Step 4: 测试** — workflow skill 触发子图调用计数 +1

- [ ] **Step 5: Commit**

---

### Task 5: L3 资源层

- [ ] **Step 1:** `skills/foo/references/*.md` 目录约定

- [ ] **Step 2:** `load_l3(skill_name, query)` 仅返回 top 文件片段

- [ ] **Step 3:** code_agent 在 traceback 时自动 `load_l3`

- [ ] **Step 4: Commit**

---

### Task 6: 摘要记忆节点

- [ ] **Step 1:** 当 `messages` token 估计 > 阈值，插入 `summarize_node` 压缩历史

- [ ] **Step 2:** 摘要写入 state `summary: str`，后续轮次 system 引用

- [ ] **Step 3: Commit**

---

### Task 7: 多会话 API

- [ ] **Step 1:** `sessions` 表 + `GET/POST/DELETE /v1/sessions`

- [ ] **Step 2:** `thread_id` 与 session 绑定；收藏字段 `starred`

- [ ] **Step 3: UI** 侧栏会话列表（Plan 05 增量 Task）

- [ ] **Step 4: Commit**

---

## Spec Coverage (V2 PRD)

| 需求 | Task |
|------|------|
| Supervisor + 2 专家 | 1–3 |
| workflow Handoff | 4 |
| L3 | 5 |
| 分层记忆摘要 | 6 |
| 多会话 | 7 |
| §3.3.1 subgraph.invoke | 2–3 Langfuse |

## 未覆盖 → Plan 07

- 并行 `Send`、质检 Agent、多租户
