const express = require("express");

const router = express.Router();

const expenseController = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", 
    authMiddleware,
    roleMiddleware("ADMIN","MANAGER"),
    expenseController.createExpense);

router.get("/", 
    authMiddleware,
    roleMiddleware("ADMIN","MANAGER"),
    expenseController.getExpenses);

router.get("/:id", 
    authMiddleware,
    roleMiddleware("ADMIN","MANAGER"),
    expenseController.getExpenseById);

router.put("/:id", 
    authMiddleware,
    roleMiddleware("ADMIN","MANAGER"),
    expenseController.updateExpense);

router.delete("/:id", 
    authMiddleware,
    roleMiddleware("ADMIN"),
    expenseController.deleteExpense);

module.exports = router;