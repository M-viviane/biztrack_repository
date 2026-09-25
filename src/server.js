const express = require("express");
const helmet = require("helmet");

const app = express();

app.use(helmet());
app.use(express.json());

app.listen(5000, () => {
  console.log("BizTrack server running on port 5000");
});