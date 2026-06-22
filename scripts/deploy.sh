#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Agent Flow Container — Deploy to 1.14.158.173
# ============================================================
# Usage: ./scripts/deploy.sh
# Prerequisites:
#   - SSH key configured for root@1.14.158.173
#   - Docker & Docker Compose installed on server

SERVER_HOST="1.14.158.173"
SERVER_USER="root"
SERVER_PATH="/root/agentFlowContainer"
COMPOSE_FILE="docker-compose.server.yml"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== 1. Push shared-ui submodule ==="
cd "$REPO_ROOT/packages/shared-ui"
git push origin main 2>&1 || echo "  (already up to date)"

echo "=== 2. Push parent repo ==="
cd "$REPO_ROOT"
git push origin main 2>&1 || echo "  (already up to date)"

echo "=== 3. SSH → pull + rebuild ==="
ssh "${SERVER_USER}@${SERVER_HOST}" <<ENDSSH
set -e
cd ${SERVER_PATH}

echo "  → git pull"
git pull origin main

echo "  → update submodules"
git submodule update --init --recursive

echo "=== 4. Rebuild & restart api + fe ==="
docker compose -f ${COMPOSE_FILE} up -d --build api fe

echo "  → wait for containers..."
sleep 8

echo "  → health check"
curl -s http://localhost:8000/health && echo "  ✓ backend healthy" || echo "  ⚠ backend health check failed"
curl -s -o /dev/null -w "  fe HTTP %{http_code}" http://localhost:3000/ && echo "" || echo "  ⚠ fe check failed"

echo ""
echo "=== containers ==="
docker compose -f ${COMPOSE_FILE} ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
ENDSSH

echo ""
echo "=== Deploy complete ==="
echo "  Backend:  http://${SERVER_HOST}:8000"
echo "  Frontend: http://${SERVER_HOST}:3000"
