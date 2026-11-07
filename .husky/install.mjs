// Runs on `npm install` (the "prepare" script) to switch on the git hooks.
// Skipped in production and CI, where dev tools like husky are not installed
// (e.g. `npm ci --omit=dev`), so the install does not fail there.
if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
  process.exit(0);
}

const husky = (await import("husky")).default;
console.log(husky());
