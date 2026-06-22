# Split Desktop to Separate Repo

## Goal

将 `desktop/` 从 monorepo 拆出为独立 repo；`packages/shared-ui/` 提取为独立 repo，通过 git submodule 被 `fe/` 和新 `desktop` repo 共同引用。

## Current State

```
agentFlowContainer/
├── pnpm-workspace.yaml    # fe, desktop, packages/*
├── package.json            # root scripts (dev:desktop, test:desktop, etc.)
├── backend/                # Python FastAPI (unaffected)
├── fe/                     # Nuxt 3 web app
├── desktop/                # Electron desktop app (to be migrated out)
├── packages/
│   └── shared-ui/          # @agent-flow/shared-ui — shared Vue components/composables
├── resource-server/
├── skills/
└── docker-compose.yml
```

**Key coupling facts:**
- `fe/` and `desktop/` both depend on `@agent-flow/shared-ui: workspace:*`
- No direct cross-imports between `fe/` and `desktop/`
- `pnpm-workspace.yaml` at repo root covers all three packages

## Target State

### Repo 1: `agentFlowContainer` (current, modified)

```
agentFlowContainer/
├── pnpm-workspace.yaml    # fe, packages/*
├── package.json            # desktop scripts removed
├── backend/
├── fe/                    # unchanged
├── packages/
│   └── shared-ui/         # → git submodule (not inline code)
├── resource-server/
├── skills/
└── docker-compose.yml
```

- `desktop/` deleted
- `packages/shared-ui/` replaced with git submodule pointing to `agent-flow-shared-ui` repo

### Repo 2: `agent-flow-shared-ui` (new)

- Content: exact copy of current `packages/shared-ui/`
- Single package: `@agent-flow/shared-ui`
- Consumed by both `fe/` and `desktop/` via git submodule

### Repo 3: `agent-flow-desktop` (new, outside current repo)

```
agent-flow-desktop/
├── pnpm-workspace.yaml    # packages/*
├── package.json
├── electron/
├── src/
├── shared/                # desktop-only constants (unchanged)
├── packages/
│   └── shared-ui/         # → git submodule
├── tests/
└── vitest.config.ts
```

- Content: exact copy of current `desktop/`
- `@agent-flow/shared-ui: workspace:*` protocol unchanged
- Own `pnpm-workspace.yaml` covering `packages/*`

## Implementation Steps

### Step 1: Create `agent-flow-shared-ui` repo

1. Create new empty repo on Git platform
2. Extract `packages/shared-ui/` from current repo
3. Push to new repo
4. In current repo: replace `packages/shared-ui/` with `git submodule add <shared-ui-url> packages/shared-ui`

### Step 2: Migrate `desktop` to new repo

1. Create new empty repo `agent-flow-desktop`
2. Copy `desktop/` content into new repo root
3. In new repo: `git submodule add <shared-ui-url> packages/shared-ui`
4. Create `pnpm-workspace.yaml` with `packages/*`
5. Verify build: `pnpm install && pnpm build && pnpm test`

### Step 3: Clean up current repo

1. Delete `desktop/`
2. Update root `pnpm-workspace.yaml`: remove `desktop` from package list
3. Update root `package.json`: remove `dev:desktop`, `test:desktop` scripts
4. Verify `fe/` still builds: `cd fe && pnpm install && pnpm test`

## What Does NOT Change

- `fe/` — zero code changes, all import paths preserved
- `backend/` — unaffected
- `packages/shared-ui/` — internal code unchanged
- `desktop/` code — all import paths preserved (`@agent-flow/shared-ui`, `shared/` constants)

## Verification

| Check | Command |
|---|---|
| fe builds | `cd fe && pnpm test` |
| desktop builds (new repo) | `cd <desktop-repo> && pnpm test` |
| shared-ui tests | `cd packages/shared-ui && pnpm test` |
| backend tests | `cd backend && pytest -v` |
| submodule init | `git submodule update --init --recursive` succeeds |
