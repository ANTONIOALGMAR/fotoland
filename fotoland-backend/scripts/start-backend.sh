#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

docker compose up -d rabbitmq postgres

wait_for_services() {
  local service="$1"
  local timeout=60
  local elapsed=0

  echo "waiting for $service to be healthy..."
  while true; do
    status="$(docker compose ps "$service" --format '{{.Status}}' || true)"
    if [[ "$status" == *healthy* || "$status" == *"(healthy)"* ]]; then
      echo "$service is healthy"
      break
    fi

    if (( elapsed > timeout )); then
      echo "timeout waiting for $service to be healthy (current status: $status)"
      exit 1
    fi

    ((elapsed+=2))
    sleep 2
  done
}

wait_for_services rabbitmq
wait_for_services postgres

echo "Starting Spring Boot backend"
./mvnw spring-boot:run
