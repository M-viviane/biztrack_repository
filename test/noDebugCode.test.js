// BT-005: scan the source code for debug leftovers.

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const srcDir = path.join(__dirname, "..", "src");

const jsFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return jsFiles(full);
    return entry.name.endsWith(".js") ? [full] : [];
  });

test("no console output mentions tokens, JWTs or roles", () => {
  const found = [];
  for (const file of jsFiles(srcDir)) {
    fs.readFileSync(file, "utf8")
      .split(/\r?\n/)
      .forEach((line, i) => {
        if (
          /console\./.test(line) &&
          /token|jwt|decoded|role|access/i.test(line)
        ) {
          found.push(`${path.relative(srcDir, file)}:${i + 1}: ${line.trim()}`);
        }
      });
  }
  assert.deepEqual(found, []);
});

test("middleware files contain no console.log at all", () => {
  const found = jsFiles(path.join(srcDir, "middleware")).filter((file) =>
    /console\.log/.test(fs.readFileSync(file, "utf8")),
  );
  assert.deepEqual(found, []);
});

test("route files have no code after module.exports", () => {
  const found = [];
  for (const file of jsFiles(path.join(srcDir, "routes"))) {
    const text = fs.readFileSync(file, "utf8");
    const afterExport = text.slice(text.lastIndexOf("module.exports"));
    const rest = afterExport.split(/\r?\n/).slice(1).join("").trim();
    if (rest !== "") found.push(path.basename(file));
  }
  assert.deepEqual(found, []);
});
