const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

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

// Current user: returns the logged-in user's own details
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


module.exports = router;