@AGENTS.md

# Claude-Specific Instructions

## Behavioral Rules

- Follow the project rules in AGENTS.md exactly.
- Enter plan mode for non-trivial tasks before writing code; get confirmation before implementing.
- Keep changes minimal and focused — do not refactor code outside the current task scope.
- Do not add docstrings, comments, or type annotations to code you did not change.
- Never auto-commit. Only create git commits when explicitly asked.
- Ask before creating files that were not explicitly requested.
- 实施多 Task 计划时，优先阅读 `docs/superpowers/plans/` 对应文件，按 Task 顺序交付可运行增量。
- 动 `fe/` 时遵循 Nuxt 约定：路由在 `app/pages/`，共享状态用 **Pinia**（`app/stores/`），样式用 **UnoCSS** utility class，副作用与 API 封装在 `composables/`，Electron 主进程代码只在 `electron/`。

## Test Discipline

- Run the relevant test suite after code changes.
- **Backend:** `cd backend && pytest -v`
- **Frontend:** `cd fe && pnpm test`（Vitest）
- Do not mark a task done if tests are failing.
- Mock 外部依赖时与现有模式一致：后端 `conftest.py` / `monkeypatch`；前端 mock API / IPC。

## Project Context

### Backend

- **Graph 拓扑：**
  - `SUPERVISOR_MODE=off`: `START → prepare → rag → chat → END`
  - `SUPERVISOR_MODE=llm`: `START → prepare → planner → rag|chat → … → END`
- **API：** `GET /health`，`POST /v1/chat`（SSE，`thread_id` + `message`）。
- **配置入口：** `app/config.py` + `.env`；密钥勿写入代码或提交。

### Frontend (`fe/`)

- **结构：** Nuxt（`app/`）+ Electron（`electron/main.ts`、`electron/preload.ts`）。
- **状态：** Pinia（`@pinia/nuxt`）；`defineStore` 写在 `app/stores/useXxxStore.ts`，组件用 `storeToRefs` + actions。
- **样式：** UnoCSS（`@unocss/nuxt` + `uno.config.ts`）；模板里写 class，重复模式提取为 `shortcuts`，勿默认写 scoped CSS。
- **构建：** Vite（Nuxt 内置）；改 Vite 行为优先 `nuxt.config.ts` → `vite`，测试与构建共用同一工具链。
- **对接后端：** SSE 聊天流、文档上传等走 `NUXT_PUBLIC_API_BASE` 指向的 FastAPI；类型可放在 `fe/types/`。
- **桌面能力：** 文件对话框、本地路径等经 preload 暴露的 IPC，不在 Vue 组件里直接 `require('electron')`。
