const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/sales-summary",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  reportController.getSalesSummary,
);

router.get(
  "/expense-summary",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  reportController.getExpenseSummary,
);

router.get(
  "/revenue",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  reportController.getRevenue,
);

router.get(
  "/profit",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  reportController.getProfit,
);

module.exports = router;
