const userService = require("../services/userService");

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

// GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
};
