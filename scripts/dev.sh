#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
API_PORT="${API_PORT:-8000}"
EXPO_PORT="${EXPO_PORT:-8081}"
EXPO_TARGET="${EXPO_TARGET:-}"
DOCKER_WAIT_SECONDS="${DOCKER_WAIT_SECONDS:-120}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
BACKEND_PID=""
EXPO_PID=""
EXPO_NODE_CMD=()
CLEANED_UP=0

log() {
  printf "\033[1;34m[e-lawyer]\033[0m %s\n" "$1"
}

fail() {
  printf "\033[1;31m[e-lawyer]\033[0m %s\n" "$1" >&2
  exit 1
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    fail "Docker Compose is required to start PostgreSQL."
  fi
}

docker_daemon_ready() {
  docker info >/dev/null 2>&1
}

ensure_docker_daemon() {
  if docker_daemon_ready; then
    return 0
  fi

  if [[ "$(uname -s)" == "Darwin" ]] && [[ -d "/Applications/Docker.app" ]]; then
    log "Docker daemon is not running. Starting Docker Desktop..."
    open -ga Docker >/dev/null 2>&1 || true
    local attempts=$((DOCKER_WAIT_SECONDS / 2))
    if (( attempts < 1 )); then
      attempts=1
    fi
    for _ in $(seq 1 "$attempts"); do
      if docker_daemon_ready; then
        log "Docker daemon is ready."
        return 0
      fi
      sleep 2
    done
  fi

  fail "Docker daemon is not running. Open Docker Desktop, wait until it is ready, then rerun npm run dev:all."
}

cleanup() {
  if (( CLEANED_UP == 1 )); then
    return 0
  fi
  CLEANED_UP=1
  log "Stopping app processes..."
  if [[ -n "$EXPO_PID" ]] && kill -0 "$EXPO_PID" >/dev/null 2>&1; then
    kill "$EXPO_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}

wait_for_postgres() {
  log "Waiting for PostgreSQL..."
  for _ in {1..40}; do
    if compose exec -T postgres pg_isready -U elawyer -d elawyer >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  fail "PostgreSQL did not become ready in time."
}

configure_expo_node() {
  if ! command -v node >/dev/null 2>&1; then
    fail "Node.js is required. Install Node 20, then rerun this command."
  fi

  local major
  major="$(node -p 'Number(process.versions.node.split(".")[0])')"
  if (( major >= 20 )); then
    EXPO_NODE_CMD=("node")
    return 0
  fi

  if command -v node20 >/dev/null 2>&1; then
    EXPO_NODE_CMD=("node20")
    log "Current Node is $(node -v); using node20 for Expo."
    return 0
  fi

  if [[ -x "/opt/homebrew/opt/node@20/bin/node" ]]; then
    EXPO_NODE_CMD=("/opt/homebrew/opt/node@20/bin/node")
    log "Current Node is $(node -v); using Homebrew node@20 for Expo."
    return 0
  fi

  if [[ -x "/usr/local/opt/node@20/bin/node" ]]; then
    EXPO_NODE_CMD=("/usr/local/opt/node@20/bin/node")
    log "Current Node is $(node -v); using Homebrew node@20 for Expo."
    return 0
  fi

  if command -v npx >/dev/null 2>&1; then
    EXPO_NODE_CMD=("npx" "--yes" "node@20")
    log "Current Node is $(node -v); Expo will run through npx node@20."
    return 0
  fi

  fail "Expo SDK 51 expects Node >=20 <23. Current: $(node -v). Install Node 20 or Homebrew node@20."
}

ensure_backend_env() {
  if [[ ! -f "$BACKEND_DIR/.env" ]]; then
    log "Creating backend/.env from backend/.env.example"
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  fi
}

ensure_backend_venv() {
  local install_marker="$BACKEND_DIR/.venv/.e-lawyer-installed"
  if [[ ! -x "$BACKEND_DIR/.venv/bin/python" ]]; then
    log "Creating backend virtualenv..."
    "$PYTHON_BIN" -m venv "$BACKEND_DIR/.venv"
  fi

  if [[ ! -f "$install_marker" ]]; then
    log "Installing backend dependencies..."
    "$BACKEND_DIR/.venv/bin/python" -m pip install --upgrade pip
    (cd "$BACKEND_DIR" && "$BACKEND_DIR/.venv/bin/python" -m pip install -e ".[dev]")
    touch "$install_marker"
  fi
}

ensure_node_modules() {
  if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
    log "Installing frontend dependencies..."
    (cd "$ROOT_DIR" && npm install)
  fi
}

ensure_port_free() {
  local port="$1"
  local label="$2"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    fail "$label port $port is already in use by PID(s): $pids. Run npm run dev:stop, then rerun."
  fi
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR"
configure_expo_node
ensure_backend_env
ensure_node_modules
ensure_backend_venv
ensure_port_free "$API_PORT" "Backend"
ensure_port_free "$EXPO_PORT" "Expo"

log "Starting PostgreSQL container..."
ensure_docker_daemon
compose up -d postgres
wait_for_postgres

log "Running database migrations..."
(cd "$BACKEND_DIR" && ./.venv/bin/alembic upgrade head)

log "Seeding legal categories..."
(cd "$BACKEND_DIR" && ./.venv/bin/python -m app.scripts.seed_categories)

log "Starting FastAPI on http://localhost:$API_PORT"
(cd "$BACKEND_DIR" && ./.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port "$API_PORT") &
BACKEND_PID="$!"

log "Starting Expo on http://localhost:$EXPO_PORT"
EXPO_ARGS=("start" "--port" "$EXPO_PORT")
case "$EXPO_TARGET" in
  ios)
    EXPO_ARGS+=("--ios")
    ;;
  android)
    EXPO_ARGS+=("--android")
    ;;
  web)
    EXPO_ARGS+=("--web")
    ;;
  "")
    ;;
  *)
    fail "Unsupported EXPO_TARGET='$EXPO_TARGET'. Use ios, android, web, or leave it empty."
    ;;
esac
(cd "$ROOT_DIR" && EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-http://localhost:$API_PORT/api}" "${EXPO_NODE_CMD[@]}" "$ROOT_DIR/node_modules/expo/bin/cli" "${EXPO_ARGS[@]}") &
EXPO_PID="$!"

log "All services started."
log "Backend docs: http://localhost:$API_PORT/docs"
log "Expo dev server: http://localhost:$EXPO_PORT"

wait "$BACKEND_PID" "$EXPO_PID"
