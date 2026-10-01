const dashboardService = require("../services/dashboardService");

const getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardService.getDashboard();

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Failed to retrieve dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};