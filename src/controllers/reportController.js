
const reportService = require("../services/reportService");

// =========================
// SALES SUMMARY
// =========================
const getSalesSummary = async (req, res) => {
  try {
    const summary = await reportService.getSalesSummary();

    res.status(200).json({
      message: "Sales summary retrieved successfully",
      summary,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// EXPENSE SUMMARY
// =========================
const getExpenseSummary = async (req, res) => {
  try {
    const summary = await reportService.getExpenseSummary();

    res.status(200).json({
      message: "Expense summary retrieved successfully",
      summary,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// REVENUE
// =========================
const getRevenue = async (req, res) => {
  try {
    const result = await reportService.getRevenue();

    res.status(200).json({
      message: "Revenue calculated successfully",
      revenue: result.revenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// PROFIT
// =========================
const getProfit = async (req, res) => {
  try {
    const result = await reportService.getProfit();

    res.status(200).json({
      message: "Profit calculated successfully",
      revenue: result.revenue,
      totalExpenses: result.totalExpenses,
      profit: result.profit,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// EXPORTS
// =========================
module.exports = {
  getSalesSummary,
  getExpenseSummary,
  getRevenue,
  getProfit,
};

