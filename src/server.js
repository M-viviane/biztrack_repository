// Starts the HTTP server. All routes and middleware live in app.js,
// so tests can load the app without opening a port.
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`BizTrack server running on port ${PORT}`);
});
