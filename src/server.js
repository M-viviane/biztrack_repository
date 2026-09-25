const express = require("express");

const app = express();

const productRoutes = require("./routes/productRoutes");

// Middleware
app.use(express.json());

// Product routes
app.use("/api/products", productRoutes);

// Start server
app.listen(5000, () => {
  console.log("BizTrack server running on port 5000");
});