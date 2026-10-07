const express = require("express");

const router = express.Router();

const purchaseController = require("../controllers/purchaseController");

// Create purchase
router.post("/", purchaseController.createPurchase);

// Get all purchases
router.get("/", purchaseController.getPurchases);

// Get purchase by ID
router.get("/:id", purchaseController.getPurchaseById);

// Update purchase
router.put("/:id", purchaseController.updatePurchase);

// Delete purchase
router.delete("/:id", purchaseController.deletePurchase);

module.exports = router;