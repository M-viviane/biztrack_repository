// BT-004: every business endpoint must require a logged-in user.
//
// This test finds EVERY route in the app automatically, so a new route
// added later without authMiddleware will make it fail.
// It uses a fake Prisma client, so it never touches a real database.

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const express = require("express");

// The only routes anyone may call without logging in.
const PUBLIC_ROUTES = new Set([
  "GET /api/healthroutes/",
  "POST /api/auth/register",
  "POST /api/auth/login",
]);

// Must pass the config check in src/config/env.js (at least 32 characters).
const TEST_SECRET = "test-only-secret-that-is-at-least-32-chars";
process.env.JWT_SECRET = TEST_SECRET;
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

// ---- Fake Prisma: any database call fails, so nothing real is touched ----
const prismaPath = path.join(__dirname, "..", "src", "config", "prisma.js");
const failingModel = new Proxy({}, {
  get: () => async () => {
    throw new Error("fake database");
  },
});
require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: new Proxy({}, { get: () => failingModel }),
};

// ---- Record where each router is mounted (Express 5 does not keep it) ----
const mounts = [];
const originalUse = express.application.use;
express.application.use = function (mountPath, ...handlers) {
  if (typeof mountPath === "string") {
    for (const h of handlers) {
      if (h && Array.isArray(h.stack)) mounts.push({ mountPath, router: h });
    }
  }
  return originalUse.call(this, mountPath, ...handlers);
};

const app = require("../src/app");
const authMiddleware = require("../src/middleware/authMiddleware");
express.application.use = originalUse;

// ---- Build the full list of routes: "METHOD /full/path" + its handlers ----
const routes = [];
const addRoute = (prefix, route) => {
  for (const method of Object.keys(route.methods)) {
    routes.push({
      key: `${method.toUpperCase()} ${prefix}${route.path}`,
      handlers: route.stack.map((layer) => layer.handle),
    });
  }
};

for (const layer of app.router.stack) {
  if (layer.route) addRoute("", layer.route); // routes defined in app.js
}
for (const { mountPath, router } of mounts) {
  for (const layer of router.stack) {
    if (layer.route) addRoute(mountPath, layer.route);
  }
}

// Silence the middleware's console.log output during the tests.
const originalLog = console.log;
const originalError = console.error;
let server;
let baseUrl;

before(async () => {
  console.log = () => {};
  console.error = () => {};
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  console.log = originalLog;
  console.error = originalError;
});

const call = (key, token) => {
  const [method, routePath] = key.split(" ");
  const url = baseUrl + routePath.replace(/:\w+/g, "1");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const body = method === "GET" ? undefined : "{}";
  return fetch(url, { method, headers, body });
};

const tokenFor = (role) => jwt.sign({ id: 1, role }, TEST_SECRET);

// ---- Sanity: the route list is complete --------------------------------
test("every router mounted in app.js was found", () => {
  const mountedRouters = app.router.stack.filter(
    (layer) => layer.handle && Array.isArray(layer.handle.stack)
  );
  assert.equal(mounts.length, mountedRouters.length);
  assert.ok(routes.length > 30, `found only ${routes.length} routes`);
});

// ---- Criterion 2: every non-public route uses authMiddleware -----------
test("every route except health/auth login+register uses authMiddleware", () => {
  const missing = routes
    .filter((r) => !PUBLIC_ROUTES.has(r.key))
    .filter((r) => !r.handlers.includes(authMiddleware))
    .map((r) => r.key);

  assert.deepEqual(missing, [], `routes without authMiddleware:\n${missing.join("\n")}`);
});

test("every protected route really answers 401 without a token", async () => {
  const notBlocked = [];
  for (const r of routes) {
    if (PUBLIC_ROUTES.has(r.key)) continue;
    const res = await call(r.key);
    if (res.status !== 401) notBlocked.push(`${r.key} -> ${res.status}`);
  }
  assert.deepEqual(notBlocked, []);
});

// ---- Criterion 1: all report routes require ADMIN or MANAGER -----------
const reportRoutes = () => routes.filter((r) => r.key.includes(" /api/reports/"));

test("there are report routes to check", () => {
  assert.ok(reportRoutes().length >= 4);
});

test("STAFF is refused (403) on every report route", async () => {
  for (const r of reportRoutes()) {
    const res = await call(r.key, tokenFor("STAFF"));
    assert.equal(res.status, 403, r.key);
  }
});

test("ADMIN and MANAGER get past the role check on every report route", async () => {
  for (const role of ["ADMIN", "MANAGER"]) {
    for (const r of reportRoutes()) {
      const res = await call(r.key, tokenFor(role));
      // The fake database makes the controller fail with 500, which proves
      // the request got through authMiddleware and roleMiddleware.
      assert.ok(![401, 403].includes(res.status), `${role} ${r.key} -> ${res.status}`);
    }
  }
});

// ---- BT-005: no debug routes, no token or role logging ------------------
test("no debug *-test routes exist", () => {
  const debugRoutes = routes.filter((r) => /-test\b/.test(r.key)).map((r) => r.key);
  assert.deepEqual(debugRoutes, []);
});

test("login and role checks print nothing to the console", async () => {
  const printed = [];
  console.log = (...args) => printed.push(args.join(" "));
  console.error = (...args) => printed.push(args.join(" "));
  try {
    await call("GET /api/auth/profile", tokenFor("STAFF")); // valid token -> 200
    await call("GET /api/reports/profit", tokenFor("STAFF")); // wrong role -> 403
    await call("GET /api/auth/profile", "not-a-real-token"); // bad token -> 401
  } finally {
    console.log = () => {};
    console.error = () => {};
  }
  assert.deepEqual(printed, []);
});
