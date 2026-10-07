const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

// ===============================
// PUBLIC ROUTES
// ===============================

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);


// ===============================
// PROTECTED ROUTES
// ===============================

// Test authentication
router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      message: "You are authenticated",
      user: req.user
    });
  }
);


// ===============================
// ADMIN ROUTE
// ===============================

// Only ADMIN users can access this route
router.get(
  "/admin-test",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin. You have access to this route.",
      user: req.user
    });
  }
);


// ===============================
// MANAGER ROUTE
// ===============================

// Only MANAGER users can access this route
router.get(
  "/manager-test",
  authMiddleware,
  roleMiddleware("MANAGER"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Manager. You have access to this route.",
      user: req.user
    });
  }
);


// ===============================
// STAFF ROUTE
// ===============================

// Only STAFF users can access this route
router.get(
  "/staff-test",
  authMiddleware,
  roleMiddleware("STAFF"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Staff. You have access to this route.",
      user: req.user
    });
  }
);


module.exports = router;