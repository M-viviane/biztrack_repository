const express = require("express");

const router = express.Router();

const inventoryController = require("../controllers/inventoryController");
const authmiddleware = require("../middleware/authMiddleware");
const rolemiddleware = require("../middleware/roleMiddleware");

// Stock IN
router.post(
  "/stock-in",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER"),

  inventoryController.stockIn,
);

// Stock OUT
router.post(
  "/stock-out",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER"),

  inventoryController.stockOut,
);

// Current inventory
router.get(
  "/",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER", "STAFF"),

  inventoryController.getInventory,
);

// Inventory by product
router.get(
  "/product/:productId",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER", "STAFF"),

  inventoryController.getInventoryByProduct,
);

// All movements
router.get(
  "/movements",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER", "STAFF"),

  inventoryController.getMovements,
);

// Movements/history for one product
router.get(
  "/movements/product/:productId",
  authmiddleware,
  rolemiddleware("ADMIN", "MANAGER", "STAFF"),
  inventoryController.getMovementsByProduct,
);

module.exports = router;
