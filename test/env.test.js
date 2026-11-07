// BT-006: the app must refuse to start with missing or invalid config.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");

// Loading env.js checks process.env straight away, so give it valid values.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET ??= "x".repeat(32);

const { parseEnv } = require("../src/config/env");

const valid = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/biztrack",
  JWT_SECRET: "a".repeat(32),
};

// Returns the error message for a config, or "" if it is valid.
const problemsWith = (config) => {
  try {
    parseEnv(config);
    return "";
  } catch (error) {
    return error.message;
  }
};

// ---- Valid config and defaults -----------------------------------------
test("a valid config is accepted, with defaults filled in", () => {
  const env = parseEnv(valid);
  assert.equal(env.PORT, 5000);
  assert.equal(env.NODE_ENV, "development");
  assert.deepEqual(env.CORS_ORIGINS, []);
});

// ---- PORT comes from env -----------------------------------------------
test("PORT comes from the environment and becomes a number", () => {
  assert.equal(parseEnv({ ...valid, PORT: "8080" }).PORT, 8080);
});

test("an invalid PORT is rejected", () => {
  assert.match(problemsWith({ ...valid, PORT: "abc" }), /PORT/);
  assert.match(problemsWith({ ...valid, PORT: "70000" }), /PORT/);
});

// ---- DATABASE_URL ------------------------------------------------------
test("DATABASE_URL is required and must be a postgresql:// URL", () => {
  assert.match(
    problemsWith({ JWT_SECRET: valid.JWT_SECRET }),
    /DATABASE_URL is required/,
  );
  assert.match(
    problemsWith({ ...valid, DATABASE_URL: "mysql://x@localhost/db" }),
    /postgresql:\/\//,
  );
});

// ---- JWT_SECRET --------------------------------------------------------
test("JWT_SECRET is required", () => {
  assert.match(
    problemsWith({ DATABASE_URL: valid.DATABASE_URL }),
    /JWT_SECRET is required/,
  );
});

test("JWT_SECRET shorter than 32 characters is rejected", () => {
  assert.match(
    problemsWith({ ...valid, JWT_SECRET: "a".repeat(31) }),
    /at least 32 characters/,
  );
  assert.equal(problemsWith({ ...valid, JWT_SECRET: "a".repeat(32) }), "");
});

test("the placeholder secret from .env.example is rejected", () => {
  assert.match(
    problemsWith({ ...valid, JWT_SECRET: "replace-with-a-long-random-secret" }),
    /placeholder/,
  );
});

// ---- NODE_ENV ----------------------------------------------------------
test("NODE_ENV must be development, test or production", () => {
  assert.equal(parseEnv({ ...valid, NODE_ENV: "test" }).NODE_ENV, "test");
  assert.match(problemsWith({ ...valid, NODE_ENV: "staging" }), /NODE_ENV/);
});

// ---- CORS_ORIGINS ------------------------------------------------------
test("CORS_ORIGINS is split into a list of URLs", () => {
  const env = parseEnv({
    ...valid,
    CORS_ORIGINS: "https://app.example.com, https://admin.example.com",
  });
  assert.deepEqual(env.CORS_ORIGINS, [
    "https://app.example.com",
    "https://admin.example.com",
  ]);
});

test("CORS_ORIGINS entries that are not URLs are rejected", () => {
  assert.match(
    problemsWith({ ...valid, CORS_ORIGINS: "not-a-url" }),
    /CORS_ORIGINS/,
  );
});

test("CORS_ORIGINS is required in production", () => {
  assert.match(
    problemsWith({ ...valid, NODE_ENV: "production" }),
    /CORS_ORIGINS is required in production/,
  );
  assert.equal(
    problemsWith({
      ...valid,
      NODE_ENV: "production",
      CORS_ORIGINS: "https://app.example.com",
    }),
    "",
  );
});

test("every problem is reported at once", () => {
  const message = problemsWith({ PORT: "abc" });
  assert.match(message, /PORT/);
  assert.match(message, /DATABASE_URL/);
  assert.match(message, /JWT_SECRET/);
});

// ---- The real server refuses to start ----------------------------------
test("server.js exits with code 1 and explains why when config is missing", () => {
  // Run from an empty folder so no .env file is picked up.
  const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), "biztrack-env-"));
  const serverPath = path.join(__dirname, "..", "src", "server.js");

  const result = spawnSync(process.execPath, [serverPath], {
    cwd: emptyDir,
    env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot },
    encoding: "utf8",
    timeout: 20000,
  });

  fs.rmSync(emptyDir, { recursive: true, force: true });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid configuration/);
  assert.match(result.stderr, /DATABASE_URL is required/);
  assert.match(result.stderr, /JWT_SECRET is required/);
});

// ---- .env.example ------------------------------------------------------
test(".env.example lists every variable with placeholders, no real secrets", () => {
  const example = fs.readFileSync(
    path.join(__dirname, "..", ".env.example"),
    "utf8",
  );
  for (const name of [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "CORS_ORIGINS",
  ]) {
    assert.match(example, new RegExp(`^${name}=`, "m"), `${name} missing`);
  }
  assert.match(example, /USER:PASSWORD/);
  assert.match(example, /JWT_SECRET=replace-with-a-long-random-secret/);
});
