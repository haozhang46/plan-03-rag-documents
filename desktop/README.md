# Agent Flow Desktop

Local Electron app: **DeepSeek API** + **LangGraph ReAct sidecar** + **git/shell tools** on your machine.

## Prerequisites

- Node.js 20+ and pnpm
- Python 3.11+ with backend venv installed (`cd ../backend && pip install -e ".[dev]"`)
- DeepSeek API key

## Dev

From repo root:

```bash
pnpm install
cd desktop && pnpm dev
```

On first run: **Settings** → enter DeepSeek API key → **Workspace** → pick project folder.

## Architecture

- `electron/main.ts` — spawns Python sidecar (`python -m app.desktop`), executor HTTP `:17351`
- `backend/app/desktop/` — LOCAL_MODE FastAPI, `general-react` ReAct flow
- `packages/shared-ui` — shared chat UI with `fe/`

## Sidecar env (set by Electron)

| Variable | Purpose |
|----------|---------|
| `DEEPSEEK_API_KEY` | User key from encrypted store |
| `WORKSPACE_ROOT` | Selected project folder |
| `DESKTOP_EXECUTOR_URL` | `http://127.0.0.1:17351` |
| `SIDECAR_PORT` | Default `8765` |

## Tests

```bash
cd ../backend && pytest -v
cd ../desktop && pnpm test
cd ../fe && pnpm test
```
