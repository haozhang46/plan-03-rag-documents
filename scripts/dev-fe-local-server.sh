#!/usr/bin/env bash
# Frontend only — local Nuxt dev against remote Agent Flow API.
#
# Usage:
#   ./scripts/dev-fe-local-server.sh
#   ./scripts/dev-fe-local-server.sh --no-install

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FE="$ROOT/fe"
ENV_FILE="$FE/.env.localServer"
INSTALL=1

for arg in "$@"; do
  case "$arg" in
    --no-install) INSTALL=0 ;;
    -h|--help)
      echo "Usage: $0 [--no-install]"
      echo "  Loads fe/.env.localServer and runs Nuxt on http://localhost:3000"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f "$FE/.env.localServer.example" ]]; then
    cp "$FE/.env.localServer.example" "$ENV_FILE"
    echo "Created $ENV_FILE from example."
  else
    echo "Error: missing $ENV_FILE (and no .env.localServer.example)" >&2
    exit 1
  fi
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${NUXT_PUBLIC_API_BASE:-}" ]]; then
  echo "Error: NUXT_PUBLIC_API_BASE is not set in $ENV_FILE" >&2
  exit 1
fi

cd "$FE"

if [[ "$INSTALL" -eq 1 ]] && [[ ! -x node_modules/.bin/nuxt ]]; then
  echo "==> Installing frontend dependencies..."
  pnpm install
fi

if ! curl -sf --connect-timeout 5 "${NUXT_PUBLIC_API_BASE%/}/health" >/dev/null 2>&1; then
  echo "Warning: ${NUXT_PUBLIC_API_BASE}/health did not respond." >&2
  echo "         Open Tencent Cloud security group TCP 8000, or check the API on the server." >&2
fi

echo "==> Frontend http://localhost:3000"
echo "    API       ${NUXT_PUBLIC_API_BASE}"
echo "    Flow      ${NUXT_PUBLIC_DEFAULT_FLOW_ID:-default}"
echo ""
echo "Press Ctrl+C to stop."

export NUXT_TELEMETRY_DISABLED=1
export CI=true
exec ./node_modules/.bin/nuxt dev
