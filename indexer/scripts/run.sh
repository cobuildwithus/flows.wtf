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

echo "[health] Route53 resolver lookup (direct)"
node - <<'JS'
const { Resolver } = require('node:dns').promises;
const HOST = 'vpce-02de1ac313d9f8b14.us-east-2.private-pg.psdb.cloud';
const resolver = new Resolver();
resolver.setServers(['169.254.169.253', '10.0.0.2']);
resolver.resolve4(HOST)
  .then((res) => {
    console.log(res);
    process.exit(0);
  })
  .catch((err) => {
    console.error('[health] Route53 resolve FAIL', err.code || err.message || err);
    process.exit(1);
  });
JS

echo "[health] Regional host DNS lookup (us-east-2.private-pg.psdb.cloud)"
node -e "require('node:dns').promises.lookup('us-east-2.private-pg.psdb.cloud').then(console.log).catch(e=>{console.error('DNS FAIL',e.code||e);process.exit(1);})"

echo "[health] Regional host TLS handshake (6432)"
node - <<'JS'
const tls = require('node:tls');
const host = 'us-east-2.private-pg.psdb.cloud';
const socket = tls.connect({ host, port: 6432, servername: host }, () => {
  console.log('TLS authorized?', socket.authorized, socket.authorizationError || '');
  socket.end();
});
socket.on('error', (e) => {
  console.error('TLS FAIL', e.message || e);
  process.exit(1);
});
socket.on('end', () => process.exit(0));
JS

echo "[health] Regional host SELECT 1"
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
