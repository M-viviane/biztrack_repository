const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// POST - Create product
// Manager only
router.post(
  "/",
  authenticateToken,
  requireRole("MANAGER"),
  createProduct
);

// GET - Get all products
// Manager and Staff
router.get(
  "/",
  authenticateToken,
  requireRole("MANAGER", "STAFF"),
  getProducts
);

// GET - Get one product
// Manager and Staff
router.get(
  "/:id",
  authenticateToken,
  requireRole("MANAGER", "STAFF"),
  getProductById
);

// PUT - Update product
// Manager only
router.put(
  "/:id",
  authenticateToken,
  requireRole("MANAGER"),
  updateProduct
);

// DELETE - Delete product
// Manager only
router.delete(
  "/:id",
  authenticateToken,
  requireRole("MANAGER"),
  deleteProduct
);

module.exports = router;