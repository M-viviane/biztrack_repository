const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// POST - Create product
router.post("/", createProduct);

// GET - Get all products
router.get("/", getProducts);

// GET - Get one product
router.get("/:id", getProductById);

// PUT - Update product
router.put("/:id", updateProduct);

// DELETE - Delete product
router.delete("/:id", deleteProduct);

module.exports = router;