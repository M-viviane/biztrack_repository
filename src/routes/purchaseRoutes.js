const express = require("express");

const router = express.Router();

const purchaseController = require("../controllers/purchaseController");
const authmiddleware = require("../middleware/authMiddleware");
const rolemiddleware = require("../middleware/roleMiddleware");

// Create purchase
router.post(
  "/",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER"),

  purchaseController.createPurchase,
);

// Get all purchases
router.get(
  "/",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER", "STAFF"),
  purchaseController.getPurchases,
);

// Get purchase by ID
router.get(
  "/:id",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER", "STAFF"),

  purchaseController.getPurchaseById,
);

// Update purchase
router.put(
  "/:id",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER"),
  purchaseController.updatePurchase,
);

// Delete purchase
router.delete(
  "/:id",
  authmiddleware,
  rolemiddleware("ADMIN"),
  purchaseController.deletePurchase,
);

module.exports = router;
