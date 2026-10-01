
const prisma = require("../config/prisma");

const allowedCategories = [
  "RENT",
  "ELECTRICITY",
  "TRANSPORT",
  "INTERNET",
  "OTHER",
];

// =========================
// CREATE EXPENSE
// =========================
const createExpense = async (data) => {
  const { title, category, description, amount, expenseDate } = data;

  if (!title || !title.trim()) {
    throw new Error("Expense title is required");
  }

  if (!allowedCategories.includes(category)) {
    throw new Error(
      "Invalid category. Use RENT, ELECTRICITY, TRANSPORT, INTERNET or OTHER"
    );
  }

  if (amount === undefined || amount === null) {
    throw new Error("Expense amount is required");
  }

  const amountNumber = Number(amount);

  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    throw new Error("Expense amount must be greater than 0");
  }

  const expense = await prisma.expense.create({
    data: {
      title,
      category,
      description: description || null,
      amount: amountNumber,
      expenseDate: expenseDate
        ? new Date(expenseDate)
        : new Date(),
    },
  });

  return expense;
};

// =========================
// GET ALL EXPENSES
// =========================
const getExpenses = async () => {
  return await prisma.expense.findMany({
    orderBy: {
      id: "asc",
    },
  });
};

// =========================
// GET EXPENSE BY ID
// =========================
const getExpenseById = async (id) => {
  const expenseId = Number(id);

  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    throw new Error("Invalid expense ID");
  }

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
    },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  return expense;
};

// =========================
// UPDATE EXPENSE
// =========================
const updateExpense = async (id, data) => {
  const expenseId = Number(id);

  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    throw new Error("Invalid expense ID");
  }

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
    },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  const updateData = {};

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      throw new Error("Expense title cannot be empty");
    }

    updateData.title = data.title;
  }

  if (data.category !== undefined) {
    if (!allowedCategories.includes(data.category)) {
      throw new Error("Invalid expense category");
    }

    updateData.category = data.category;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.amount !== undefined) {
    const amountNumber = Number(data.amount);

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      throw new Error("Expense amount must be greater than 0");
    }

    updateData.amount = amountNumber;
  }

  if (data.expenseDate !== undefined) {
    const date = new Date(data.expenseDate);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid expense date");
    }

    updateData.expenseDate = date;
  }

  updateData.updatedAt = new Date();

  return await prisma.expense.update({
    where: {
      id: expenseId,
    },
    data: updateData,
  });
};

// =========================
// DELETE EXPENSE
// =========================
const deleteExpense = async (id) => {
  const expenseId = Number(id);

  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    throw new Error("Invalid expense ID");
  }

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
    },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  return await prisma.expense.delete({
    where: {
      id: expenseId,
    },
  });
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};