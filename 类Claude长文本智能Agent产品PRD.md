# 类Claude长文本智能Agent产品PRD

## 1. 产品概述

### 1.1 产品定位

一款**开源可私有化、长文本强推理、海量技能按需加载、多 Agent 协作**的通用智能 Agent 平台，对标 Claude 核心能力，支持超长文档解析、多步自主工具推理、复杂任务自主规划，同时规避商用平台付费限制、上下文溢出、模型分心问题。采用 **LangGraph 作为唯一编排运行时**（非「只有一个 Agent」）：在统一图内调度**规划、执行、检索、审核**等多角色 Agent 分工协作，避免 Dify 等与自研 Agent 双引擎叠层，适配个人开发、企业内部工具、私有化部署场景。

### 1.2 核心解决痛点

- 解决普通 AI 对话工具**上下文截断、长文档推理弱、幻觉高**的问题
- 解决传统 Agent **全量加载技能导致 Token 爆炸、准确率暴跌、冷启动延迟高**的工程问题
- 解决 LangSmith 商用付费、闭源受限的问题，实现**全开源 LLMOps 可观测**
- 避免低代码平台（如 Dify）与自研 Agent 双引擎冲突，**架构边界清晰、可深度定制**

### 1.3 核心对标能力（对标 Claude）

- 超长上下文对话、大文件/整本书/合同批量解析（模型窗口 + RAG + 摘要记忆组合策略）
- 自主规划、多步工具调用、自我纠错、闭环推理
- **多 Agent 协作**：主管 Agent 拆解任务，专家 Agent（文档/RAG/代码/检索等）分治执行，结果汇总与交叉校验
- 海量技能渐进式加载、按需调用，无上下文冗余
- 完善的会话管理、文档上传、历史记忆、可追溯日志

## 2. 整体技术架构（最终落地方案）

采用 **自研/开源 Chat 前端 + Agent API 服务（LangGraph）+ 技能调度 + Langfuse 可观测** 的分层架构，**不依赖 Dify 或任何一体化低代码 Agent 平台**。

### 2.1 架构分层

| 层级 | 技术选型 | 职责 |
|------|----------|------|
| **应用层** | React/Next.js 对话 UI（或 Open WebUI / Lobe Chat 作 V1 壳） | 多会话、消息流式展示、文档上传、模型切换、用户反馈 |
| **API 网关层** | FastAPI / LangServe | REST + SSE/WebSocket、鉴权、限流、会话与文件元数据 CRUD |
| **核心 Agent 层** | LangGraph | 多 Agent 图（Supervisor / Handoff / 子图）、任务规划、工具调用、自我纠错、共享 Checkpoint |
| **技能调度层** | lib-agent-skills（或自研 SKILL.md 注册表） | 渐进式披露 L1/L2/L3、语义路由、技能缓存 |
| **RAG / 文档层** | 自研 Pipeline（Unstructured / PyMuPDF 等 + 向量库） | 解析、分片、嵌入、检索、溯源引用 |
| **可观测层** | Langfuse | 全链路 Trace、Prompt 版本、成本与延迟统计 |
| **数据存储层** | PostgreSQL + 向量库（Qdrant/pgvector）+ 对象存储/本地目录 | 用户/会话、Agent 状态、知识库、技能文件 |

### 2.2 请求主路径（单一编排运行时，多 Agent 协作）

```text
用户 → Chat UI → Agent API
                    ├─ 鉴权 / 会话加载
                    └─ LangGraph 主图（Supervisor）
                           ├─ 规划 Agent：意图识别、任务拆解、选技能/选子 Agent
                           ├─ 专家子图（按需 Handoff）
                           │    ├─ 文档/RAG Agent（长文本、溯源）
                           │    ├─ 工具/代码 Agent（执行、报错修复）
                           │    └─ 检索/联网 Agent（补充信息）
                           ├─ 各 Agent 共享：L1/L2/L3 技能加载、Checkpoint、会话状态
                           ├─ 汇总 Agent（可选）：合并子结果、一致性检查、生成最终回复
                           └─ Langfuse Trace（按 Agent/子图分段上报）
                    → 流式响应 → UI
```

**原则**：
- **编排唯一**：所有 Agent 协作与工具调用**仅经 LangGraph 一张（或多子）图**，不在 UI / 网关层另起一套 Agent 逻辑。
- **多 Agent 非多平台**：多个 Agent 是图内节点/子图，不是多个独立产品或框架并联。

### 2.3 长上下文策略（写清实现边界）

| 场景 | 策略 |
|------|------|
| 对话历史在模型窗口内 | 全量带入 + LangGraph 摘要节点定期压缩 |
| 单文档超过模型窗口 | 分片入库 → RAG 检索 + 引用片段进 Prompt |
| 需要「全书级」问答 | 多轮检索 + 地图-归约（Map-Reduce）子图，不强行全文塞入 |

## 3. 核心功能需求

### 3.1 基础对话能力（对标 Claude 基础体验）

- 多会话管理：新建、删除、重命名、收藏
- 长对话：滑动窗口 + 摘要记忆（LangGraph checkpoint + 可选向量长期记忆）
- 多模型适配：Claude、GPT-4o、本地开源模型（Qwen/Llama）通过统一 LLM 适配层切换
- 富文本输出：代码块、表格、公式、结构化报告（Markdown 渲染）

### 3.2 长文档处理能力（核心特色）

- 支持 PDF、TXT、Word、Markdown 上传
- 解析 → 分片 → 向量化 → 检索问答；支持总结、对比、纠错、细节问答
- 回答带溯源引用（chunk_id / 页码 / 原文片段）

### 3.3 渐进式技能 Agent（核心技术亮点）

基于 lib-agent-skills（或自研等价模块）实现三级渐进式披露：

- **L1 元数据层（启动预加载）**：仅技能名称 + 极简描述
- **L2 理解层（意图触发）**：动态注入完整 SKILL 指令、参数、示例、边界
- **L3 执行层（深水区）**：代码报错、深度文档查询时加载参考资源，走独立检索/文件读取，少占对话上下文

配套：语义路由前置过滤、Prompt 缓存、LangGraph 独立状态存储。

#### 3.3.1 Skill 类型与是否启用子 Agent（对齐 Superpowers 实践）

**核心原则**：加载 Skill ≠ 启动子 Agent。Skill 是「操作手册」注入；子 Agent / 专家子图是「另起一个隔离上下文的执行体」。二者正交，由 Skill 元数据 + Supervisor 共同决定。

| 概念 | 作用 | 是否新开 Agent / 子图 |
|------|------|------------------------|
| **Skill（SKILL.md）** | L2/L3 按需注入指令、流程、边界 | **默认否**——注入当前活跃节点（规划或专家）的 Prompt |
| **子 Agent / 专家子图** | 隔离上下文执行独立子任务，结果回传主图 | **是**——LangGraph Handoff / `Send` 并行子图 |
| **Supervisor** | 意图识别、选 Skill、决定是否派子图 | 主图节点，不重复实现专家逻辑 |

**Skill 分类（在 `SKILL.md` frontmatter 或注册表声明）**

| 类型 | `skill_type` | 行为 | 典型示例 |
|------|--------------|------|----------|
| **指令型** | `instruction` | 仅触发 L2（必要时 L3）；当前 Agent 按规范执行 | 调试流程、TDD、头脑风暴、领域规范 |
| **工作流型** | `workflow` | 加载 L2 后，**允许** Supervisor 按文中步骤 spawn 专家子图 | 分任务实现、并行修多份测试、计划执行 |
| **资源型** | `resource` | 以 L3 为主：大段参考文档/脚本，走检索或文件读取，少进对话上下文 | API 文档、长模板、示例库 |

**何时启用子 Agent（专家子图）——须同时满足**

1. Skill 为 `workflow`，或 Supervisor 判定任务满足下列之一：
   - 子任务**上下文需隔离**（避免主会话污染，如「只读某测试文件修失败用例」）
   - 子任务**可并行**且无共享写冲突（V3：多 `Send`）
   - 子任务**角色专用**（RAG 专答文档、代码 Agent 专跑沙箱）
2. 不满足时 **禁止** 为省 Token 滥用子图（子图有 Handoff 与汇总成本）

**何时仅用 Skill、不启子 Agent**

- 纯流程/规范约束（先 brainstorm 再写代码、先复现再修 bug）
- 单 Agent 内工具调用即可完成的短任务
- 强依赖完整会话历史的连贯对话

**与 Superpowers 的映射（实现参考）**

| Superpowers | 本产品 |
|-------------|--------|
| `Skill` 工具加载 `SKILL.md` | L1 路由 → L2/L3 注入当前节点 |
| 多数 skill（TDD、debugging 等） | `instruction`，**不** spawn |
| `subagent-driven-development` | `workflow`：规划 → 实现子图 → 审核子图（串行） |
| `dispatching-parallel-agents` | `workflow` + V3 并行 `Send` |
| 被派发的 subagent 跳过 `using-superpowers` | 子图 Prompt **不**注入全局 skill 发现流程，仅带任务所需 L2 |

**执行决策流（运行时）**

```text
用户消息
  → L1 匹配候选 Skill
  → Supervisor：选 0~N 个 Skill
       ├─ instruction / resource → 当前节点加载 L2/L3，本节点继续
       └─ workflow → 读 SKILL 内「是否 spawn」条款
            ├─ 否 / 未满足隔离·并行条件 → 本节点 + 工具
            └─ 是 → Handoff 至专家子图（独立 checkpoint 可选）
                 → 子图结果写回共享 state → Supervisor 汇总
```

**注册表示例（`skills/registry.yaml`）**

```yaml
- name: test-driven-development
  skill_type: instruction
  spawn_subagent: false

- name: subagent-driven-development
  skill_type: workflow
  spawn_subagent: true
  subgraph: implementer | spec-reviewer | code-quality-reviewer

- name: dispatching-parallel-agents
  skill_type: workflow
  spawn_subagent: true
  parallel: true   # V3
```

**可观测**：Langfuse 事件区分 `skill.load`（L2/L3）与 `subgraph.invoke`（子 Agent），避免把每次 skill 加载误记为 multi-agent 调用。

### 3.4 复杂 Agent 自主推理与多 Agent 协作（LangGraph 核心）

**单 Agent 能力**
- 自主任务拆解、子任务分步执行
- 工具失败自动重试、补充检索、向用户澄清
- 多工具联动：文档、计算、联网、代码执行等
- 分层记忆：短期对话 + 用户向量记忆（可选）+ 任务 Checkpoint

**多 Agent 协作（产品标配能力，分阶段增强）**
- 与 Skill 分工见 **§3.3.1**：默认 Skill 只注入指令；仅 `workflow` 或 Supervisor 判定满足条件时 Handoff 子图
- **Supervisor 模式**：主 Agent 根据意图将子任务路由到专家子图，子图完成后回传状态
- **Handoff**：子 Agent 可在信息不足时交还规划 Agent 或切换至另一专家（如 RAG → 代码）
- **并行子任务**（V3 强化）：无依赖子任务多子图并行，汇总节点合并结果
- **共享状态**：`thread_id` + Checkpoint 跨 Agent 可见，避免各 Agent 各记各的、上下文断裂
- **可观测**：Langfuse 按 `agent_name` / `subgraph` 分段 Trace，便于排查「哪个 Agent 跑偏」

### 3.5 开源 LLMOps 可观测能力

- Langfuse：对话 / 推理 / 工具 / 技能加载全链路 Trace
- Prompt 版本管理、A/B 对比
- Token、延迟、成功率、错误率统计
- 可选：Phoenix 本地调试（开发环境），MLflow 模型实验（非必选）

### 3.6 基础后台能力（自研 API + 存储）

- 用户管理、JWT/OAuth 登录、会话持久化
- 知识库与文档增量更新、检索参数配置
- 接口限流、基础安全头、操作审计日志
- 多租户（V3）：租户 ID 隔离数据与技能权限

## 4. 非功能需求

### 4.1 性能要求

- 技能动态加载延迟 ≤500ms（L2 缓存命中无感）
- 长文档（10 万字）解析 + 入库 ≤30s（可异步，完成后通知）
- TTFT：相较「全量技能进 Prompt」基线优化 ≥30%
- 技能 Token 开销较全量加载降低 85%–95%（以固定技能集压测验收）

### 4.2 稳定性要求

- 多轮复杂任务 Checkpoint 可恢复，服务重启不丢进行中的图状态
- 技能切换无指令串扰（L2 按轮次 scoped 注入）
- 文件损坏、超时：重试 + 用户可读错误信息

### 4.3 扩展性要求

- 新增技能：添加标准 `SKILL.md` + 注册表配置
- 可插拔 LLM Provider、向量库、对象存储
- Docker Compose / K8s 私有化部署

## 5. 技术选型最终确定

| 类别 | 选型 | 说明 |
|------|------|------|
| **前端** | Next.js + 流式 Chat 组件（V1 可用 Open WebUI 对接同一 API 加速） | 不绑定 Dify |
| **Agent 运行时** | LangGraph + LangChain 工具生态 | 唯一编排引擎；图内多 Agent（Supervisor + 子图） |
| **API** | FastAPI + SSE | 会话、上传、Agent 调用 |
| **技能** | lib-agent-skills 或自研 SKILL 注册表 | 渐进式披露 |
| **RAG** | LangChain + pgvector/Qdrant | 与 Agent 同仓库维护 |
| **可观测** | Langfuse | 生产必备 |
| **数据库** | PostgreSQL | 用户、会话、元数据 |
| **部署** | Docker Compose | 本地/服务器私有化 |

**明确不采用**：Dify、Flowise 等自带 Agent 编排的一体化平台（避免双运行时）。

## 6. 版本迭代规划（三期落地）

### V1.0 快速验证期（1–2 周）— 可用版

- FastAPI + LangGraph：基础对话、流式输出、单会话 Checkpoint
- 简易 Chat UI（或 Open WebUI 调 Agent API）
- 文档上传 + 解析分片 + 基础 RAG 问答
- 技能 L1 + L2 按需加载；注册表区分 `instruction` / `workflow`（见 §3.3.1）
- Langfuse 基础 Trace
- 接入 1 个商用模型 + 1 个本地模型（验证适配层）

### V2.0 能力强化期（2–3 周）— 成熟版

- LangGraph 子图：规划 Agent + 至少 2 个专家 Agent；`workflow` 类 Skill 可触发 Handoff（§3.3.1）
- 多步工具、失败重试与 Handoff 交还规划 Agent
- 技能 L3 + 语义路由优化；Prompt 缓存
- 分层记忆（摘要节点 + 可选用户向量库）
- 多会话、收藏、模型切换；知识库管理后台（最小 CRUD）
- Langfuse Prompt 版本与成本看板

### V3.0 生产稳定期（约 1 个月）— 企业版

- 多 Agent 并行子任务、任务流水线、审核/质检 Agent
- 技能权限、批量管理、技能目录/市场
- 多租户、审计、限流与安全加固
- 性能与成本优化；完整 Compose/K8s 与备份方案

## 7. 核心亮点总结（产品差异化）

1. **零平台绑定**：全开源栈，无 Dify/LangSmith 依赖，Agent 逻辑完全自控
2. **单一编排 + 多 Agent**：LangGraph 一张图内多角色协作，无低代码与自研双轨、也无多框架并联
3. **渐进式披露**：工业级技能加载，解决海量 Skill 的 Token 与准确率问题
4. **长文本可落地**：RAG + 摘要 + 模型窗口组合策略清晰，不虚假承诺「无损 100K 全文」

> （注：文档部分内容可能由 AI 生成，已按「去掉 Dify」修订架构与排期。）
