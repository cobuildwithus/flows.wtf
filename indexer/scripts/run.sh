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
const dns = require('node:dns');
dns.setDefaultResultOrder?.('ipv4first');
const dnsPromises = dns.promises;
const tls = require('node:tls');
const { Client } = require('pg');

(async () => {
  try {
    const rawUrl = process.env.DATABASE_URL || process.env.PONDER_DATABASE_URL || '';
    if (!rawUrl) {
      throw new Error('DATABASE_URL not set');
    }

    const parsedUrl = new URL(rawUrl);
    const host = parsedUrl.hostname;
    const port = Number(parsedUrl.port || 5432);
    const safeUrl = rawUrl.replace(/(:\/\/[^:]+:)[^@]+@/, '$1***@');

    console.log('DB URL (masked):', safeUrl);

    const dnsResult = await dnsPromises.lookup(host, { family: 4, all: true });
    console.log('DNS lookup ->', dnsResult);

    await new Promise((resolve, reject) => {
      const socket = tls.connect({ host, port, servername: host }, () => {
        console.log('TLS authorized?', socket.authorized, socket.authorizationError || '');
        socket.end();
        resolve();
      });
      socket.on('error', reject);
    });

    const client = new Client({
      connectionString: rawUrl,
      ssl: { rejectUnauthorized: true },
    });
    await client.connect();
    const result = await client.query('select 1');
    console.log('SELECT 1 ->', result.rows);
    await client.end();

    process.exit(0);
  } catch (error) {
    console.error('PROBE FAIL:', error);
    process.exit(1);
  }
})();
JS

pnpm exec ponder start --port "${PORT}" --schema "${DB_SCHEMA}" --views-schema "${VIEWS_SCHEMA}"
