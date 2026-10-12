
const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Only authenticated Admins can list or view users
router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getUserById
);

module.exports = router;

