#!/usr/bin/env bash
set -euo pipefail

if [ -z "${ALCHEMY_KEY_FLOWS_INDEXER:-}" ]; then
  echo "[run] Missing required environment variable ALCHEMY_KEY_FLOW_INDEXER" >&2
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[run] Missing required environment variable DATABASE_URL" >&2
  exit 1
fi

DEPLOY_ID="$(cat .deploy_id 2>/dev/null || date -u +%Y%m%d%H%M%S)"

DB_SCHEMA_PREFIX="${DB_SCHEMA_PREFIX:-flows}"
VIEWS_SCHEMA="${VIEWS_SCHEMA:-flows_onchain}"
DB_SCHEMA="${DB_SCHEMA_PREFIX}_${DEPLOY_ID}"

echo "[run] Starting Ponder on PORT=${PORT} with schema ${DB_SCHEMA} and views schema ${VIEWS_SCHEMA}"
pnpm exec ponder start --port "${PORT}" --schema "${DB_SCHEMA}" --views-schema "${VIEWS_SCHEMA}"
