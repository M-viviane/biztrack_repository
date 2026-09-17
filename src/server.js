const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BizTrack API"
  });
});



app.listen(5000, () => {
  console.log(`BizTrack server is running on port 5000`);
});