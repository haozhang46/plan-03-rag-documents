#!/usr/bin/env bash
# Start self-hosted SearXNG for agent web search (free, no API key).
#
# Usage:
#   ./scripts/setup-searxng.sh          # docker compose up -d searxng
#   ./scripts/setup-searxng.sh --stop   # docker compose stop searxng
#
# After start, verify:
#   curl 'http://localhost:8080/search?q=test&format=json' | head
#
# Backend (.env):
#   WEB_SEARCH_ENABLED=true
#   SEARXNG_BASE_URL=http://localhost:8080

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACTION="start"

for arg in "$@"; do
  case "$arg" in
    --stop) ACTION="stop" ;;
    -h|--help)
      echo "Usage: $0 [--stop]"
      exit 0
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is required." >&2
  exit 1
fi

cd "$ROOT"

if [[ "$ACTION" == "stop" ]]; then
  docker compose stop searxng
  echo "SearXNG stopped."
  exit 0
fi

docker compose up -d searxng
echo "SearXNG starting on http://localhost:8080"
echo "Set in .env: WEB_SEARCH_ENABLED=true  SEARXNG_BASE_URL=http://localhost:8080"
