const expenseService = require("../services/expenseService");

// CREATE
const createExpense = async (req, res) => {
  try {
    const expense = await expenseService.createExpense(req.body);

    res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// GET ALL
const getExpenses = async (req, res) => {
  try {
    const expenses = await expenseService.getExpenses();

    res.status(200).json({
      message: "Expenses retrieved successfully",
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET BY ID
const getExpenseById = async (req, res) => {
  try {
    const expense = await expenseService.getExpenseById(
      req.params.id
    );

    res.status(200).json({
      message: "Expense retrieved successfully",
      expense,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// UPDATE
const updateExpense = async (req, res) => {
  try {
    const expense = await expenseService.updateExpense(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// DELETE
const deleteExpense = async (req, res) => {
  try {
    await expenseService.deleteExpense(req.params.id);

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};