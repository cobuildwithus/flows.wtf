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

echo "[health] Patching resolv.conf to prefer 169.254.169.253"
TMP="/tmp/resolv.conf.$RANDOM"
if { echo "nameserver 169.254.169.253"; cat /etc/resolv.conf; } > "${TMP}"; then
  if cp "${TMP}" /etc/resolv.conf 2>/dev/null; then
    echo "[health] resolv.conf patched to prioritize Route 53 resolver"
  else
    echo "[health] resolv.conf patch skipped (read-only?)"
  fi
  rm -f "${TMP}"
else
  echo "[health] Unable to prepare resolv.conf patch" >&2
fi

echo "[health] Resolver config (/etc/resolv.conf)"
node -e "console.log(require('node:fs').readFileSync('/etc/resolv.conf','utf8'))"

if DB_INFO=$(node - <<'JS'
const raw = process.env.DATABASE_URL || process.env.PONDER_DATABASE_URL || '';
if (!raw) process.exit(1);
try {
  const url = new URL(raw);
  if (!url.hostname) process.exit(1);
  process.stdout.write(url.hostname);
  process.stdout.write('\n');
  process.stdout.write(url.port || '');
} catch (err) {
  process.exit(1);
}
JS
); then
  IFS=$'\n' read -r DB_HOST DB_PORT <<< "${DB_INFO}"
  DB_PORT="${DB_PORT:-5432}"
  export DB_HOST DB_PORT
  echo "[health] Database host parsed from connection string: ${DB_HOST}"
else
  DB_HOST=""
  DB_PORT="5432"
  export DB_HOST DB_PORT
  echo "[health] Warning: unable to parse database host from connection string" >&2
fi

echo "[health] Public DNS lookup (example.com via OS resolver)"
node - <<'JS'
const dns = require('node:dns');
dns.setDefaultResultOrder?.('ipv4first');
dns.promises.lookup('example.com', { family: 4 })
  .then((res) => {
    console.log(res);
    process.exit(0);
  })
  .catch((err) => {
    console.error('example.com DNS FAIL', err.code || err.message || err);
    process.exit(1);
  });
JS

echo "[health] Database host DNS lookup (${DB_HOST:-us-east-2.private-pg.psdb.cloud})"
node - <<'JS'
const dns = require('node:dns');
dns.setDefaultResultOrder?.('ipv4first');
const host = process.env.DB_HOST || 'us-east-2.private-pg.psdb.cloud';
dns.promises.lookup(host, { family: 4 })
  .then((res) => {
    console.log(res);
    process.exit(0);
  })
  .catch((err) => {
    console.error('DNS FAIL', err.code || err.message || err);
    process.exit(1);
});
JS

echo "[health] Database host Route53 lookup (169.254.169.253 priority)"
node - <<'JS'
const { Resolver } = require('node:dns').promises;
const resolver = new Resolver();
resolver.setServers(['169.254.169.253', '10.0.0.2']);
const host = process.env.DB_HOST || 'us-east-2.private-pg.psdb.cloud';
resolver.resolve4(host)
  .then((addresses) => {
    console.log(addresses);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Route53 DNS FAIL', err.code || err.message || err);
    process.exit(1);
  });
JS

echo "[health] Database host TLS handshake (${DB_HOST:-us-east-2.private-pg.psdb.cloud}:${DB_PORT})"
node - <<'JS'
const tls = require('node:tls');
const host = process.env.DB_HOST || 'us-east-2.private-pg.psdb.cloud';
const port = Number(process.env.DB_PORT || process.env.PONDER_DB_PORT || 5432);
const socket = tls.connect({ host, port, servername: host }, () => {
  console.log('TLS authorized?', socket.authorized, socket.authorizationError || '');
  socket.end();
});
socket.on('error', (e) => {
  console.error('TLS FAIL', e.message || e);
  process.exit(1);
});
socket.on('end', () => process.exit(0));
JS

echo "[health] Database host SELECT 1"
node - <<'JS'
const { Client } = require('pg');
(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });
  await client.connect();
  const result = await client.query('select 1');
  console.log('SELECT 1 ->', result.rows);
  await client.end();
  process.exit(0);
})().catch((e) => {
  console.error('PG FAIL', e.message || e);
  process.exit(1);
});
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

const defaultHost = 'us-east-2.private-pg.psdb.cloud';
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

    const host = url.hostname || process.env.DB_HOST || defaultHost;
    const port = Number(url.port || process.env.DB_PORT || 5432);
    console.log(`DB host: ${host}, port: ${port}`);

    const a = await lookupWithRetry(host);
    console.log('DNS lookup ->', a); // expect a 10.x IP in your VPC

    await new Promise((res, rej) => {
      const s = tls.connect({ host, port, servername: host }, () => {
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
