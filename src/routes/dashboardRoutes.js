const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", 
    authMiddleware,
    roleMiddleware("ADMIN","MANAGER"),
    dashboardController.getDashboard);

module.exports = router;