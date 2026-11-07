// Starts the HTTP server. All routes and middleware live in app.js,
// so tests can load the app without opening a port.

// Check the configuration first. If it is invalid, print what is wrong
// and stop with exit code 1, so a bad deploy fails straight away.
let env;
try {
  env = require("./config/env");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = require("./app");

app.listen(env.PORT, () => {
  console.log(`BizTrack server running on port ${env.PORT} (${env.NODE_ENV})`);
});
