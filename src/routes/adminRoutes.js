const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

// ===============================
// ADMIN ROUTES
// ===============================

// Get all users
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getAllUsers
);

module.exports = router;