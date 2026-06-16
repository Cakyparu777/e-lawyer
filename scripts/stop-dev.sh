#!/usr/bin/env bash
set -Eeuo pipefail

PORTS=("${API_PORT:-8000}" "${EXPO_PORT:-8081}")

for port in "${PORTS[@]}"; do
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    printf "\033[1;34m[e-lawyer]\033[0m No process listening on port %s\n" "$port"
    continue
  fi

  printf "\033[1;34m[e-lawyer]\033[0m Stopping port %s: %s\n" "$port" "$pids"
  kill $pids >/dev/null 2>&1 || true
done

