// Starts the HTTP server. All routes and middleware live in app.js,
// so tests can load the app without opening a port.
const app = require("./app");

app.listen(5000, () => {
  console.log("BizTrack server running on port 5000");
});
