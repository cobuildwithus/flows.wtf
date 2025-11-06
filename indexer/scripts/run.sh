#!/usr/bin/env bash
set -euo pipefail

if [ -z "${ALCHEMY_API_KEY:-}" ]; then
  echo "[run] Missing required environment variable ALCHEMY_API_KEY" >&2
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
node - <<'JS'
const dns = require('node:dns').promises;
const tls = require('node:tls');
const { Client } = require('pg');

const HOST = 'vpce-02de1ac313d9f8b14.us-east-2.private-pg.psdb.cloud';
(async () => {
  try {
    const url = new URL(process.env.DATABASE_URL || process.env.PONDER_DATABASE_URL || '');
    const safe = String(url).replace(/(:\/\/[^:]+:)[^@]+@/, '$1***@');
    console.log('DB URL (masked):', safe);

    const a = await dns.lookup(HOST);
    console.log('DNS lookup ->', a); // expect a 10.x IP in your VPC

    await new Promise((res, rej) => {
      const s = tls.connect({ host: HOST, port: 5432, servername: HOST }, () => {
        console.log('TLS authorized?', s.authorized, s.authorizationError || '');
        s.end();
        res();
      });
      s.on('error', rej);
    });

    const client = new Client({
      connectionString: process.env.DATABASE_URL || process.env.PONDER_DATABASE_URL,
      ssl: { rejectUnauthorized: true },
    });
    await client.connect();
    const r = await client.query('select 1');
    console.log('SELECT 1 ->', r.rows);
    await client.end();
    process.exit(0);
  } catch (e) {
    console.error('PROBE FAIL:', e);
    process.exit(1);
  }
})();
JS
pnpm exec ponder start --port "${PORT}" --schema "${DB_SCHEMA}" --views-schema "${VIEWS_SCHEMA}"
