const express = require("express");

const router = express.Router();

const inventoryController = require("../controllers/inventoryController");

// Stock IN
router.post("/stock-in", inventoryController.stockIn);

// Stock OUT
router.post("/stock-out", inventoryController.stockOut);

// Current inventory
router.get("/", inventoryController.getInventory);

// Inventory by product
router.get(
  "/product/:productId",
  inventoryController.getInventoryByProduct
);

// All movements
router.get("/movements", inventoryController.getMovements);

// Movements/history for one product
router.get(
  "/movements/product/:productId",
  inventoryController.getMovementsByProduct
);

module.exports = router;