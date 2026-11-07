const express = require("express");

const router = express.Router();

const saleController = require("../controllers/saleController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "STAFF"),
  saleController.createSale,
);
router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "STAFF"),
  saleController.getSales,
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "STAFF"),
  saleController.getSaleById,
);

module.exports = router;
