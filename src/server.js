const express = require("express");

const app = express();

const productRoutes = require("./routes/productRoutes");
const inventoryRoutes=require("./routes/inventoryRoutes");
const categoryRoutes=require("./routes/categoryRoutes");
const healthRoutes = require("./routes/healthRoutes");
const purchaseRoutes=require("./routes/purchaseRoutes");
const saleRoutes=require("./routes/saleRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes=require("./routes/dashboardRoutes")




// Middleware
app.use(express.json());

// Product routes
app.use("/api/products", productRoutes);
//inventory routes
app.use("/api/inventory", inventoryRoutes);
//category routes
app.use("/api/category", categoryRoutes);
//health routes

app.use("/api/healthroutes", healthRoutes);
//purchaseRoutes
app.use("/api/purchase", purchaseRoutes);
//saleRoutes
app.use("/api/sales", saleRoutes);
//expenseRoutes
app.use("/api/expenses", expenseRoutes);
//reportRoutes
app.use("/api/reports", reportRoutes);
//dashboardRoutes
app.use("/api/dashboard", dashboardRoutes);
// Start server
app.listen(5000, () => {
  console.log("BizTrack server running on port 5000");
});