#!/usr/bin/env bash
# Start Postgres (optional), backend API, and Nuxt frontend for local development.
#
# Usage:
#   ./scripts/dev.sh              # db + backend + frontend
#   ./scripts/dev.sh --no-db      # skip docker (use existing Postgres or memory fallback)
#   ./scripts/dev.sh --no-install # skip pip/yarn install

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

START_DB=1
INSTALL=1
BACKEND_PID=""
FRONTEND_PID=""
STARTED=0

docker_ready() {
  command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

for arg in "$@"; do
  case "$arg" in
    --no-db) START_DB=0 ;;
    --no-install) INSTALL=0 ;;
    -h|--help)
      echo "Usage: $0 [--no-db] [--no-install]"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

cleanup() {
  if [[ "$STARTED" -eq 0 ]]; then
    return
  fi
  echo ""
  echo "Shutting down..."
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
  [[ -n "$BACKEND_PID" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.example — set OPENAI_API_KEY before chatting."
  cp .env.example .env
fi

# Export root .env for child processes (NUXT_PUBLIC_* for frontend, etc.)
set -a
# shellcheck disable=SC1091
source "$ROOT/.env"
set +a

if [[ "$START_DB" -eq 1 ]]; then
  if docker_ready; then
    echo "==> Starting Postgres (pgvector)..."
    if docker compose up -d db; then
      echo "    Waiting for database..."
      for _ in $(seq 1 30); do
        if docker compose exec -T db pg_isready -U agent -d agentflow >/dev/null 2>&1; then
          echo "    Database ready."
          break
        fi
        sleep 1
      done
    else
      echo "    Warning: could not start Postgres; continuing without DB." >&2
    fi
  else
    echo "Warning: Docker is not running — skipping Postgres." >&2
    echo "         Chat will use in-memory checkpoint; RAG/upload need DB." >&2
    echo "         Start Docker Desktop, or run: ./scripts/dev.sh --no-db" >&2
  fi
fi

echo "==> Backend setup..."
if [[ ! -d backend/.venv ]]; then
  python3.11 -m venv backend/.venv 2>/dev/null || python3 -m venv backend/.venv
fi
# shellcheck source=/dev/null
source backend/.venv/bin/activate
cd backend
if [[ "$INSTALL" -eq 1 ]]; then
  pip install -q -e ".[dev]"
fi
cd "$ROOT"

port_in_use() {
  lsof -i ":$1" >/dev/null 2>&1
}

wait_for_health() {
  for _ in $(seq 1 30); do
    if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  return 1
}

fe_deps_ok() {
  [[ -x "$ROOT/fe/node_modules/.bin/nuxt" ]]
}

install_frontend() {
  if command -v yarn >/dev/null 2>&1; then
    (cd fe && yarn install --frozen-lockfile 2>/dev/null || yarn install)
  elif command -v pnpm >/dev/null 2>&1; then
    (cd fe && pnpm install)
  else
    (cd fe && npm install)
  fi
}

echo "==> Frontend setup..."
if [[ "$INSTALL" -eq 1 ]]; then
  install_frontend
  if ! fe_deps_ok; then
    echo "    Repairing incomplete node_modules (nuxt missing)..."
    rm -rf fe/node_modules
    install_frontend
  fi
fi
if ! fe_deps_ok; then
  echo "Error: frontend dependencies missing. Run: cd fe && yarn install" >&2
  exit 1
fi

if port_in_use 8000; then
  if wait_for_health; then
    echo "==> API already running on http://localhost:8000 (port in use)"
    BACKEND_PID=""
  else
    echo "Error: port 8000 is in use but /health did not respond." >&2
    echo "       Stop the other process: lsof -i :8000" >&2
    exit 1
  fi
else
  echo "==> Starting API on http://localhost:8000"
  (
    cd backend
    source .venv/bin/activate
    exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ) &
  BACKEND_PID=$!
  STARTED=1
  wait_for_health || echo "    Warning: API health check timed out." >&2
fi

if port_in_use 3000; then
  echo "Warning: port 3000 is in use — frontend may fail to start." >&2
fi

echo "==> Starting frontend on http://localhost:3000"
(
  cd fe
  export NUXT_PUBLIC_API_BASE="${NUXT_PUBLIC_API_BASE:-}"
  export NUXT_TELEMETRY_DISABLED=1
  export CI=true
  if command -v yarn >/dev/null 2>&1; then
    exec yarn run dev
  elif command -v pnpm >/dev/null 2>&1; then
    exec pnpm run dev
  else
    exec npm run dev
  fi
) &
FRONTEND_PID=$!

echo ""
echo "Ready:"
echo "  Frontend  http://localhost:3000"
echo "  API       http://localhost:8000"
echo "  API docs  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

wait "$FRONTEND_PID" "$BACKEND_PID"
