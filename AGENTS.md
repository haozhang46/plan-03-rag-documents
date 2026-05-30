# Project Agent Rules

Agent Flow — 类 Claude 长文本智能 Agent 平台（LangGraph 编排 + 渐进式 Skill + RAG）。产品说明见 `类Claude长文本智能Agent产品PRD.md`；实施计划见 `docs/superpowers/plans/`。

## Stack

### Backend (`backend/`)

- **Language:** Python 3.11+
- **API:** FastAPI + SSE（`sse-starlette`）
- **Agent:** LangGraph（唯一编排层，不用 Dify）
- **LLM:** LangChain（OpenAI / Anthropic，经 `app/llm/factory.py`）
- **Database:** PostgreSQL（Checkpoint、RAG/pgvector；Docker Compose 本地起库）
- **Config:** `pydantic-settings`（`.env` / 环境变量）
- **Package manager:** `pip` + editable install（`backend/pyproject.toml`）

### Frontend (`fe/`)

- **Language:** TypeScript
- **Framework:** Nuxt 3（Vue 3）
- **Desktop:** Electron（main / preload / renderer 分离）
- **Build:** Vite（Nuxt 3 内置；开发 HMR、生产打包均走 Vite；Vitest 共用 Vite 配置）
- **Package manager:** pnpm
- **State:** Pinia（`@pinia/nuxt`；全局/跨页状态唯一方案，不用 Vuex / 大型 reactive 单例）
- **CSS:** UnoCSS（`@unocss/nuxt`；原子化 utility class，不用 Tailwind / SCSS 模块作为主方案）
- **UI / 工具（按项目选用）：** Element Plus、VueUse 等
- **Testing:** Vitest + `@vue/test-utils`（组件 / composable）；E2E 可选 Playwright

### Client-side RAG (vector sync)

- **Embed:** `fe/composables/useOllamaEmbed.ts` → Ollama `nomic-embed-text` (768-dim)
- **Sync:** `useDocumentSync` → `POST /v1/documents` + `POST /v1/documents/{id}/chunks`
- **Chat:** client sends `query_embedding`; server skips embed API when set
- **Prerequisites:** `ollama pull nomic-embed-text`; set `OLLAMA_ORIGINS=http://localhost:3000` for browser CORS
- **V1 scope:** TXT/MD client sync; PDF still uses server `POST /v1/documents/upload`

## Repository Layout

```text
agentFlowContainer/
├── backend/                 # Python 后端
│   ├── app/
│   │   ├── main.py              # FastAPI 入口
│   │   ├── config.py            # Settings
│   │   ├── api/routes/          # health, chat, documents, …
│   │   ├── agent/               # LangGraph graph, state, nodes
│   │   ├── llm/
│   │   └── skills/
│   ├── tests/
│   └── pyproject.toml
├── fe/                      # Nuxt + Electron 客户端
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── nuxt.config.ts           # Nuxt 配置；Vite 选项写在 vite: { … }
│   ├── vite.config.ts           # 可选：独立 Vite 扩展（优先 nuxt.config vite 钩子）
│   ├── uno.config.ts            # UnoCSS 规则、shortcuts、theme
│   ├── electron/                # Electron 主进程
│   │   ├── main.ts              # 窗口、协议、IPC 注册
│   │   ├── preload.ts           # contextBridge 暴露安全 API
│   │   └── utils/               # 主进程工具（可选）
│   ├── app/                     # Nuxt 应用（app/ 目录模式）
│   │   ├── app.vue
│   │   ├── pages/               # 路由页面
│   │   ├── layouts/
│   │   ├── components/
│   │   ├── composables/         # 业务逻辑、API 封装
│   │   ├── plugins/
│   │   ├── middleware/
│   │   ├── stores/              # Pinia
│   │   ├── assets/              # 静态资源；少量全局 CSS（优先 UnoCSS）
│   │   └── utils/
│   ├── public/
│   ├── server/                  # Nuxt server routes / API proxy（可选）
│   ├── types/                   # 共享 TS 类型
│   └── tests/                   # Vitest
├── skills/                  # L1 registry.yaml + SKILL.md
├── docker-compose.yml
├── .env.example
└── docs/superpowers/plans/
```

**当前 `main` 已交付（后端）：** Plan 01（API + 对话 + Checkpoint）、Plan 02（Skill 注册与 `prepare` 节点）。`fe/` 为客户端工程目录约定，与后端 `POST /v1/chat`（SSE）等 API 对接。

## Development

### Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

pytest -v

cp .env.example .env   # 填入 OPENAI_API_KEY
docker compose up -d db
uvicorn app.main:app --reload
```

- **工作目录：** 后端命令在 `backend/` 下执行（venv 激活后）。
- **Checkpoint：** `CHECKPOINTER=auto`（无 Postgres 时退回 MemorySaver）；持久对话用 `postgres`。
- **Skills 路径：** 默认仓库根目录 `skills/`，可用 `SKILLS_ROOT` 覆盖。

### Frontend (`fe/`)

```bash
cd fe
pnpm install

pnpm dev              # Vite dev server（Nuxt）
pnpm dev:electron     # Vite + Electron 联调（以 package.json scripts 为准）

pnpm build            # Vite 生产构建（Nuxt generate / build）
pnpm preview          # 预览生产构建产物
pnpm test             # Vitest（Vite 驱动）
pnpm lint             # ESLint（若已配置）
```

- **工作目录：** 前端命令在 `fe/` 下执行。
- **API 基址：** 通过环境变量配置（如 `NUXT_PUBLIC_API_BASE=http://localhost:8000`），勿在代码里写死生产地址。
- **Electron：** 渲染进程只通过 `preload` 暴露的 IPC 访问 Node/Electron API；主进程不直接操作 DOM。
- **Pinia：** store 定义在 `app/stores/`，文件名 `useXxxStore.ts`，用 `defineStore` + Composition API 风格；组件内 `storeToRefs` 解构 state/getters，actions 直接解构调用。
- **UnoCSS：** 样式写在模板 `class` 中（utility + shortcuts）；复用组合放 `uno.config.ts` 的 `shortcuts` / `rules`；主题色、间距等放 `theme`；避免大段 scoped CSS，Element Plus 深度样式例外。
- **Vite：** 构建/开发统一走 Vite；插件、alias、`optimizeDeps` 等优先在 `nuxt.config.ts` 的 `vite` 字段配置；环境变量用 `import.meta.env` / Nuxt `runtimeConfig`，勿用 Webpack 语法。
- **Git worktree：** 功能分支可用 `.worktrees/`（已在 `.gitignore`）。

## Testing

| 区域 | Runner | 命令 |
|------|--------|------|
| Backend | pytest | `cd backend && pytest -v` |
| Frontend | Vitest | `cd fe && pnpm test` |

- 改哪边跑哪边；跨端改动两边相关测试都应通过。
- Backend：单元测试优先（mock LLM / store）；Postgres 集成测试用 `RUN_INTEGRATION=1`（若存在）。
- Frontend：优先测 composable / 纯函数；组件用 `@vue/test-utils`；SSE 流式可在 composable 层 mock `fetch` / `EventSource`。
- API 边界：后端用 `TestClient` + `conftest.py`；前端用 composable 或 server route 代理测对接。

## Workflow

- Never auto-commit unless explicitly instructed.
- Prefer small, focused changes over large refactors.
- Respect existing code conventions and naming patterns.
- Ask before installing new dependencies（`backend/pyproject.toml` 或 `fe/package.json`）。
- 多步骤功能优先对照 `docs/superpowers/plans/` 中对应 Plan，保持与 PRD 一致。
- LangGraph 节点保持单一职责；后端新能力加模块后在 `graph.py` 接线。
- 前端：**跨组件 / 跨页面状态放 Pinia**（`app/stores/`）；请求封装、SSE、单次副作用放 `composables/`；页面组件保持薄。与后端契约以 OpenAPI 或共享 `types/` 为准。

## What NOT to Do

- Do not delete or overwrite files without explicit confirmation.
- Do not make sweeping refactors outside the scope of the current task.
- Do not add dependencies that were not requested.
- Do not leave debug logging or temporary code in committed changes.
- Do not assume missing context — ask when uncertain.
- Do not bypass LangGraph 做编排逻辑（业务流走 graph + nodes）。
- Do not commit `.env`、`.venv/`、`node_modules/`、`dist/`、`.output/`、`egg-info/` 或 `__pycache__/`。
- Do not在 Electron 渲染进程启用 `nodeIntegration: true`（使用 preload + contextBridge）。
- Do not用 `provide/inject`、全局 event bus 或模块级 ref 替代 Pinia 管理共享状态（组件内局部 state 除外）。
- Do not引入 Tailwind CSS、CSS Modules 或大面积 `<style scoped>` 替代 UnoCSS（覆盖第三方组件样式等少量例外可接受）。
- Do not引入 Webpack、Rollup 手动配置或 CRA 式构建链；前端构建统一 Vite（经 Nuxt）。

## Done Condition

- The requested change is implemented and working.
- Relevant tests pass (or new tests are written).
- Backend 改动：`pytest -v` 通过；Frontend 改动：`pnpm test` / `pnpm lint` 通过（若已配置）。
- All modified files are clean and production-ready.
