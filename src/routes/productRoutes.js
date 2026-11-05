const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// GET ALL PRODUCTS
// ADMIN, MANAGER and STAFF can view products
router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "STAFF"),
  productController.getProducts
);

// GET PRODUCT BY ID
// ADMIN, MANAGER and STAFF can view a product
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "STAFF"),
  productController.getProductById
);

// CREATE PRODUCT
// Only ADMIN and MANAGER can create products
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  productController.createProduct
);

// UPDATE PRODUCT
// Only ADMIN and MANAGER can update products
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  productController.updateProduct
);

// DELETE PRODUCT
// Only ADMIN can delete products
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  productController.deleteProduct
);

// RESTORE A RETIRED PRODUCT
// Only ADMIN can restore products (same as delete)
router.patch(
  "/:id/restore",
  authMiddleware,
  roleMiddleware("ADMIN"),
  productController.restoreProduct
);

module.exports = router;