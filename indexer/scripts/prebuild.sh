#!/usr/bin/env bash
set -euxo pipefail

echo "[pre-build] Bootstrapping pnpm and generating deploy id"

if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@9 --activate
else
  npm install -g pnpm@9
fi
pnpm -v

RAW="$(git rev-parse --short=12 HEAD 2>/dev/null || date -u +%Y%m%d%H%M%S)"
ID="$(printf "%s" "$RAW" | tr "[:upper:]" "[:lower:]" | sed -E "s/[^a-z0-9_]+/_/g")"
case "$ID" in
  [a-z_]* ) ;;
  * ) ID="d_${ID}" ;;
esac

echo "$ID" > .deploy_id
echo "[pre-build] Deploy id ${ID}"
