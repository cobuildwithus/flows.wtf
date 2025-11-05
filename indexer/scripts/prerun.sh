#!/usr/bin/env bash
set -euxo pipefail

echo "[pre-run] Re-enabling pnpm"

if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@9 --activate
else
  npm install -g pnpm@9
fi
pnpm -v
