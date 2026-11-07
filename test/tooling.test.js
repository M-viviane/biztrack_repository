// BT-007: tooling baseline (scripts, engines, dependencies, seed).
// Uses a fake database, so it never touches a real one.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const pkg = require("../package.json");

test("all required npm scripts exist", () => {
  for (const name of [
    "start",
    "dev",
    "lint",
    "test",
    "db:migrate",
    "db:seed",
  ]) {
    assert.ok(pkg.scripts[name], `missing script: ${name}`);
  }
  assert.equal(pkg.scripts.start, "node src/server.js");
});

test("nodemon and the prisma CLI are dev-only; the RC package is gone", () => {
  for (const name of ["nodemon", "prisma"]) {
    assert.ok(pkg.devDependencies[name], `${name} should be a devDependency`);
    assert.equal(
      pkg.dependencies[name],
      undefined,
      `${name} is still a dependency`,
    );
  }
  assert.equal(pkg.dependencies["@prisma/orm-postgres"], undefined);
  assert.equal(pkg.devDependencies["@prisma/orm-postgres"], undefined);
});

test("a Node.js version is pinned and this Node satisfies it", () => {
  assert.ok(pkg.engines && pkg.engines.node, "engines.node is missing");

  const [major, minor] = process.versions.node.split(".").map(Number);
  const supported =
    (major === 20 && minor >= 19) ||
    (major === 22 && minor >= 13) ||
    major >= 24;
  assert.ok(supported, `Node ${process.versions.node} is below engines.node`);
});

test("husky runs lint-staged on commit", () => {
  const hook = fs.readFileSync(path.join(root, ".husky", "pre-commit"), "utf8");
  assert.match(hook, /lint-staged/);
  assert.ok(pkg["lint-staged"], "lint-staged config is missing");
  assert.equal(pkg.scripts.prepare, "node .husky/install.mjs");
});

// ---- db:seed --------------------------------------------------------------
const { ROLES, seedRoles } = require("../prisma/seed");

// Fake database: just the two calls the seed uses.
const makeDb = (startingNames = []) => {
  const rows = startingNames.map((name, i) => ({ id: i + 1, name }));
  return {
    rows,
    roles: {
      findFirst: async ({ where }) =>
        rows.find((r) => r.name === where.name) || null,
      create: async ({ data }) => {
        const row = { id: rows.length + 1, ...data };
        rows.push(row);
        return row;
      },
    },
  };
};

test("seed creates ADMIN, MANAGER and STAFF on an empty database", async () => {
  const db = makeDb();
  await seedRoles(db, () => {});

  assert.deepEqual(
    db.rows.map((r) => r.name),
    ["ADMIN", "MANAGER", "STAFF"],
  );
  assert.equal(ROLES.length, 3);
});

test("seed is safe to run twice (no duplicate roles)", async () => {
  const db = makeDb(["STAFF"]);
  await seedRoles(db, () => {});
  await seedRoles(db, () => {});

  assert.equal(db.rows.length, 3);
  assert.equal(db.rows.filter((r) => r.name === "STAFF").length, 1);
});

test("seed creates no users (no passwords in code)", () => {
  const source = fs.readFileSync(path.join(root, "prisma", "seed.js"), "utf8");
  assert.doesNotMatch(source, /\.users\./);
  assert.doesNotMatch(source, /password\s*:/i);
});

test("prisma.config.ts points db:seed at prisma/seed.js", () => {
  const config = fs.readFileSync(path.join(root, "prisma.config.ts"), "utf8");
  assert.match(config, /seed:\s*"node prisma\/seed\.js"/);
});
