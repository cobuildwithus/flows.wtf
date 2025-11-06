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

echo "[health] Resolver config (/etc/resolv.conf)"
node -e "console.log(require('node:fs').readFileSync('/etc/resolv.conf','utf8'))"

echo "[health] PrivateLink DNS lookup"
node - <<'JS'
const dns = require('node:dns');
dns.setDefaultResultOrder?.('ipv4first');
const dnsPromises = dns.promises;
const HOST = 'vpce-02de1ac313d9f8b14.us-east-2.private-pg.psdb.cloud';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const maxAttempts = 5;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const res = await dnsPromises.lookup(HOST, { family: 4 });
      console.log(res);
      process.exit(0);
    } catch (err) {
      lastError = err;
      console.error(`[health] DNS attempt ${attempt}/${maxAttempts} failed:`, err.code || err.message || err);
      if (attempt < maxAttempts) {
        await sleep(1000 * attempt);
      }
    }
  }
  console.error('DNS FAIL', lastError);
  process.exit(1);
})();
JS

echo "[health] Alchemy reachability (masked key prefix ${ALCHEMY_API_KEY:0:4})"
curl --fail -sS "https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}" \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"web3_clientVersion","params":[]}'

node - <<'JS'
const dnsModule = require('node:dns');
dnsModule.setDefaultResultOrder?.('ipv4first');
const dns = dnsModule.promises;
const tls = require('node:tls');
const { Client } = require('pg');

const HOST = 'vpce-02de1ac313d9f8b14.us-east-2.private-pg.psdb.cloud';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const lookupWithRetry = async (host, attempts = 5) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await dns.lookup(host, { family: 4 });
    } catch (err) {
      lastError = err;
      console.error(`[probe] DNS attempt ${attempt}/${attempts} failed:`, err.code || err.message || err);
      if (attempt < attempts) {
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastError;
};

(async () => {
  try {
    const url = new URL(process.env.DATABASE_URL || process.env.PONDER_DATABASE_URL || '');
    const safe = String(url).replace(/(:\/\/[^:]+:)[^@]+@/, '$1***@');
    console.log('DB URL (masked):', safe);

    const a = await lookupWithRetry(HOST);
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
