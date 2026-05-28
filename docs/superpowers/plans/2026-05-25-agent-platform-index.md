# Agent 平台实施计划索引

> **For agentic workers:** 按顺序执行子计划；每个子计划结束时应产生可运行、可测试的增量。推荐 **Plan 01 → 05** 完成 V1；再执行 Plan 06（V2）、Plan 07（V3）。

**Goal:** 按 PRD《类Claude长文本智能Agent产品PRD》落地开源可私有化 Agent 平台（LangGraph 唯一编排 + 渐进式 Skill + RAG + Langfuse）。

**Architecture:** 单体 Python 后端（FastAPI）承载 Agent API；LangGraph 主图编排；技能与 RAG 为独立模块经 Supervisor 注入；Next.js 或 Open WebUI 消费 SSE。无 Dify。

**Tech Stack:** Python 3.11+, FastAPI, LangGraph, LangChain, PostgreSQL, pgvector, Langfuse, pytest, Docker Compose, Next.js 15（可选）

---

## 子计划清单与依赖

| 顺序 | 文件 | 交付物 | PRD 章节 | 依赖 |
|------|------|--------|----------|------|
| 1 | [plan-01-monorepo-agent-api.md](./2026-05-25-plan-01-monorepo-agent-api.md) | 仓库骨架、Docker、LLM 适配层、LangGraph 单节点对话、SSE、Checkpoint | §2, §3.1, §5, V1 对话 | 无 |
| 2 | [plan-02-skills-registry.md](./2026-05-25-plan-02-skills-registry.md) | L1/L2 渐进披露、`registry.yaml`、`instruction`/`workflow` 元数据 | §3.3, §3.3.1 | Plan 01 |
| 3 | [plan-03-rag-documents.md](./2026-05-25-plan-03-rag-documents.md) | 上传、解析分片、pgvector 检索、溯源引用 | §3.2, §2.3 | Plan 01 |
| 4 | [plan-04-langfuse.md](./2026-05-25-plan-04-langfuse.md) | `skill.load` / `graph.invoke` Trace、环境配置 | §3.5 | Plan 01 |
| 5 | [plan-05-chat-ui-v1.md](./2026-05-25-plan-05-chat-ui-v1.md) | Next.js 流式 Chat 或 Open WebUI 对接文档 | §2.1 应用层, V1 UI | Plan 01–04 |
| 6 | [plan-06-v2-multi-agent.md](./2026-05-25-plan-06-v2-multi-agent.md) | Supervisor、专家子图、Handoff、L3、记忆摘要 | §3.4, V2 | Plan 01–05 |
| 7 | [plan-07-v3-enterprise.md](./2026-05-25-plan-07-v3-enterprise.md) | 并行子图、多租户、技能市场、K8s | §3.6, V3 | Plan 06 |

## 目标目录结构（全项目）

```text
agentFlowContainer/
├── backend/
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py                 # FastAPI 入口
│   │   ├── config.py               # pydantic-settings
│   │   ├── api/routes/             # health, chat, documents, sessions
│   │   ├── agent/                  # LangGraph graph, state, nodes
│   │   ├── llm/                    # 多模型适配
│   │   ├── skills/                 # registry, loader, router
│   │   ├── rag/                    # ingest, retriever
│   │   └── observability/          # langfuse callbacks
│   └── tests/
├── skills/                         # SKILL.md + registry.yaml
├── web/                            # Next.js（Plan 05）
├── docker-compose.yml
├── .env.example
└── docs/superpowers/plans/
```

## V1 验收标准（Plan 01–05 完成后）

- [ ] `curl` 健康检查通过；`POST /v1/chat` SSE 流式返回
- [ ] `thread_id` Checkpoint 多轮记住上下文
- [ ] 上传 PDF 后 RAG 问答带 `chunk_id` 引用
- [ ] 触发 skill 后 Langfuse 可见 `skill.load` 事件
- [ ] 至少 2 个 LLM Provider 可通过 env 切换
- [ ] `pytest` 全绿；`docker compose up` 一键起 Postgres + API

## 执行方式

完成子计划编写后，对每个子计划文件使用：

1. **Subagent-Driven（推荐）** — `superpowers:subagent-driven-development`，每 Task 新 subagent + 双阶段 review  
2. **Inline** — `superpowers:executing-plans`，本会话按 Task 批量执行并 checkpoint

**建议：** Plan 01 用 Inline 建骨架；Plan 02–05 可并行 subagent（02 与 03 无代码冲突时）。
