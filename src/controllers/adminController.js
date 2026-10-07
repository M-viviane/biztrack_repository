const adminService = require("../services/adminService");

// ===============================
// GET ALL USERS
// ===============================

const getAllUsers = async (req, res) => {
  try {

    const users = await adminService.getAllUsers();

    res.status(200).json({
      message: "Users retrieved successfully",
      data: users
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message
    });

  }
};

module.exports = {
  getAllUsers
};