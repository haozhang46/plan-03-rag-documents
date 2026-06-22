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
REPO_URL="https://github.com/haozhang46/plan-03-rag-documents.git"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== 1. Push shared-ui submodule ==="
cd "$REPO_ROOT/packages/shared-ui"
git push origin main 2>&1 || echo "  (already up to date)"

echo "=== 2. Push parent repo ==="
cd "$REPO_ROOT"
git push origin main 2>&1 || echo "  (already up to date)"

echo "=== 3. SSH → deploy ==="
ssh "${SERVER_USER}@${SERVER_HOST}" <<ENDSSH
set -e

# First time setup: if .git is missing, clone into a temp dir and move .git
if [ ! -d ${SERVER_PATH}/.git ]; then
  echo "  → repo missing .git — initializing"
  if [ -d /root/repo-temp ]; then
    rm -rf /root/repo-temp
  fi
  git clone ${REPO_URL} /root/repo-temp
  # Preserve .env and other runtime files before replacing
  if [ -f ${SERVER_PATH}/.env ]; then
    cp ${SERVER_PATH}/.env /root/repo-temp/.env
  fi
  if [ -f ${SERVER_PATH}/docker-compose.server.yml ]; then
    cp ${SERVER_PATH}/docker-compose.server.yml /root/repo-temp/docker-compose.server.yml
  fi
  if [ -d ${SERVER_PATH}/config ]; then
    cp -r ${SERVER_PATH}/config /root/repo-temp/ 2>/dev/null || true
  fi
  rm -rf ${SERVER_PATH}
  mv /root/repo-temp ${SERVER_PATH}
  echo "  ✓ repo initialized"
fi

cd ${SERVER_PATH}

# Ensure git user is set (required for merge commits)
git config user.email "deploy@agentflow.local" 2>/dev/null || true
git config user.name "deploy-bot" 2>/dev/null || true

echo "  → git fetch + reset"
git fetch origin main
git reset --hard origin/main

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
