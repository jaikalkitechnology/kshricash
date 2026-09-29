#!/usr/bin/env node
/**
 * Kshricash API smoke test — validates the endpoints the React frontend calls
 * against their expected response shapes. Run it where the network can reach
 * the API (your machine / server), NOT inside a restricted sandbox.
 *
 * Usage:
 *   node scripts/api_smoke_test.mjs --phone 9876543210 --password 'secret'
 *   BASE_URL=https://api.vasupay.com/api/v1 node scripts/api_smoke_test.mjs -p 9876543210 -w secret
 *
 * Requires Node 18+ (global fetch).
 */

const args = process.argv.slice(2);
const getArg = (long, short) => {
  const i = args.findIndex((a) => a === long || a === short);
  return i >= 0 ? args[i + 1] : undefined;
};

const BASE_URL = process.env.BASE_URL || "https://api.vasupay.com/api/v1";
const phone = getArg("--phone", "-p") || process.env.PHONE;
const password = getArg("--password", "-w") || process.env.PASSWORD;

const C = { g: "\x1b[32m", r: "\x1b[31m", y: "\x1b[33m", d: "\x1b[2m", x: "\x1b[0m" };
const ok = (m) => console.log(`${C.g}✓${C.x} ${m}`);
const bad = (m) => console.log(`${C.r}✗${C.x} ${m}`);
const info = (m) => console.log(`${C.d}• ${m}${C.x}`);

let token = null;
let pass = 0;
let fail = 0;

async function call(method, path, { body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-json */ }
  return { status: res.status, data };
}

/** Assert that `obj` has all `keys`; report against `label`. */
function expectKeys(label, obj, keys) {
  if (obj == null || typeof obj !== "object") {
    bad(`${label}: expected object, got ${typeof obj}`);
    fail++;
    return;
  }
  const missing = keys.filter((k) => !(k in obj));
  if (missing.length) {
    bad(`${label}: missing keys [${missing.join(", ")}]`);
    fail++;
  } else {
    ok(`${label}: shape OK { ${keys.join(", ")} }`);
    pass++;
  }
}

async function main() {
  console.log(`\nKshricash API smoke test → ${C.y}${BASE_URL}${C.x}\n`);

  if (!phone || !password) {
    bad("Missing credentials. Pass --phone <phone> --password <password> (or PHONE/PASSWORD env).");
    process.exit(2);
  }

  // 1) Login
  info("POST /auth/login");
  const login = await call("POST", "/auth/login", { auth: false, body: { phone, password } });
  if (login.status !== 200 || !login.data?.access_token) {
    bad(`login failed (HTTP ${login.status}): ${JSON.stringify(login.data)}`);
    process.exit(1);
  }
  token = login.data.access_token;
  expectKeys("login response", login.data, ["access_token", "refresh_token", "user"]);
  expectKeys("login user", login.data.user, ["id", "phone", "full_name", "entity_type", "status"]);

  // 2) Endpoints used by the frontend, with expected shapes
  const checks = [
    { m: "GET", p: "/auth/me", keys: ["id", "phone", "entity_type"] },
    { m: "GET", p: "/wallets/balance", keys: ["wallets"] },
    { m: "GET", p: "/wallets/transactions?page=1&per_page=5", keys: ["items", "total", "page", "per_page"] },
    { m: "GET", p: "/transactions/?page=1&per_page=5", keys: ["items", "total", "page", "per_page"] },
    { m: "GET", p: "/reports/transactions/summary", keys: ["summary"] },
    { m: "GET", p: "/commissions/summary", keys: ["total_earned"] },
    { m: "GET", p: "/services/categories", keys: [] },
  ];

  for (const c of checks) {
    info(`${c.m} ${c.p}`);
    const res = await call(c.m, c.p);
    if (res.status >= 400) {
      bad(`${c.p}: HTTP ${res.status} ${JSON.stringify(res.data)?.slice(0, 160)}`);
      fail++;
      continue;
    }
    if (c.keys.length) expectKeys(c.p, res.data, c.keys);
    else { ok(`${c.p}: HTTP ${res.status}`); pass++; }
  }

  console.log(`\n${pass + fail} checks → ${C.g}${pass} passed${C.x}, ${fail ? C.r : ""}${fail} failed${C.x}\n`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  bad(`Unexpected error: ${e?.message || e}`);
  process.exit(1);
});
