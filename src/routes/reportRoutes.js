
const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");

router.get("/sales-summary", reportController.getSalesSummary);

router.get("/expense-summary", reportController.getExpenseSummary);

router.get("/revenue", reportController.getRevenue);

router.get("/profit", reportController.getProfit);

module.exports = router;

