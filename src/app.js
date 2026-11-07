const express = require("express");

const app = express();

// ========================================
// GLOBAL MIDDLEWARE
// ========================================

app.use(express.json());

// ========================================
// ROUTES
// ========================================

const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const healthRoutes = require("./routes/healthRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const userRoutes = require("./routes/userRoutes");

// ========================================
// AUTHENTICATION & AUTHORIZATION
// ========================================

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

// ========================================
// TASK 40 — ADMIN TEST ROUTE
// ========================================

app.get(
  "/api/admin-test",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res) => {
    res.json({
      message: "Welcome Admin! You have access."
    });
  }
);

// ========================================
// TASK 41 — MANAGER TEST ROUTE
// ========================================

app.get(
  "/api/manager-test",
  authMiddleware,
  roleMiddleware("MANAGER"),
  (req, res) => {
    res.json({
      message: "Welcome Manager! You have access."
    });
  }
);
// ========================================
// TASK 42 — STAFF TEST ROUTE
// ========================================

app.get(
  "/api/staff-test",
  authMiddleware,
  roleMiddleware("STAFF"),
  (req, res) => {
    res.json({
      message: "Welcome Staff! You have access."
    });
  }
);

// =============================================
// PRODUCT ROUTES
// =============================================

app.use("/api/products", productRoutes);

// ==============================================
// INVENTORY ROUTES
// ==============================================

app.use("/api/inventory", inventoryRoutes);
//===============================================
//supplier routes
//===============================================

app.use("/api/suppliers", supplierRoutes);

// ========================================
// CATEGORY ROUTES
// ========================================

app.use("/api/category", categoryRoutes);

// ========================================
// HEALTH ROUTES
// ========================================

app.use("/api/healthroutes", healthRoutes);

// ========================================
// PURCHASE ROUTES
// ========================================

app.use("/api/purchase", purchaseRoutes);
//======================================
//user Routes
//=======================================

app.use("/api/users", userRoutes);

// ========================================
// SALE ROUTES
// ========================================

app.use("/api/sales", saleRoutes);

// ========================================
// EXPENSE ROUTES
// ========================================

app.use("/api/expenses", expenseRoutes);

// ========================================
// REPORT ROUTES
// ========================================

app.use("/api/reports", reportRoutes);

// ========================================
// DASHBOARD ROUTES
// ========================================

app.use("/api/dashboard", dashboardRoutes);

// ========================================
// AUTHENTICATION ROUTES
// ========================================

app.use("/api/auth", authRoutes);

// ========================================
// ADMIN ROUTES
// ========================================

app.use("/api/admin", adminRoutes);

module.exports = app;
