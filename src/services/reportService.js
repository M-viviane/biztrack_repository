
const prisma = require("../config/prisma");

// =========================
// SALES SUMMARY
// =========================
const getSalesSummary = async () => {
  const sales = await prisma.sales.findMany({
    select: {
      id: true,
      total_amount: true,
      sale_date: true,
    },
    orderBy: {
      sale_date: "asc",
    },
  });

  let totalSales = 0;
  const salesByDate = {};

  for (const sale of sales) {
    const amount = Number(sale.total_amount || 0);

    totalSales += amount;

    const date = sale.sale_date
      ? new Intl.DateTimeFormat("en-CA", {
          timeZone: "Africa/Kigali",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(sale.sale_date)
      : "Unknown date";

    if (!salesByDate[date]) {
      salesByDate[date] = {
        date,
        numberOfSales: 0,
        totalAmount: 0,
      };
    }

    salesByDate[date].numberOfSales += 1;
    salesByDate[date].totalAmount += amount;
  }

  return {
    totalSales,
    numberOfSales: sales.length,
    salesByDate: Object.values(salesByDate),
  };
};

// =========================
// EXPENSE SUMMARY
// =========================
const getExpenseSummary = async () => {
  const expenses = await prisma.expense.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      amount: true,
      expenseDate: true,
    },
    orderBy: {
      expenseDate: "asc",
    },
  });

  let totalExpenses = 0;
  const expensesByCategory = {};

  for (const expense of expenses) {
    const amount = Number(expense.amount || 0);

    totalExpenses += amount;

    const category = expense.category || "OTHER";

    if (!expensesByCategory[category]) {
      expensesByCategory[category] = {
        category,
        numberOfExpenses: 0,
        totalAmount: 0,
      };
    }

    expensesByCategory[category].numberOfExpenses += 1;
    expensesByCategory[category].totalAmount += amount;
  }

  return {
    totalExpenses,
    numberOfExpenses: expenses.length,
    expensesByCategory: Object.values(expensesByCategory),
  };
};

// =========================
// REVENUE
// =========================
const getRevenue = async () => {
  const result = await prisma.sales.aggregate({
    _sum: {
      total_amount: true,
    },
  });

  const revenue = Number(result._sum.total_amount || 0);

  return {
    revenue,
  };
};

// =========================
// PROFIT
// =========================
const getProfit = async () => {
  const revenueResult = await prisma.sales.aggregate({
    _sum: {
      total_amount: true,
    },
  });

  const expenseResult = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });

  const revenue = Number(revenueResult._sum.total_amount || 0);
  const totalExpenses = Number(expenseResult._sum.amount || 0);

  const profit = revenue - totalExpenses;

  return {
    revenue,
    totalExpenses,
    profit,
  };
};

// =========================
// EXPORTS
// =========================
module.exports = {
  getSalesSummary,
  getExpenseSummary,
  getRevenue,
  getProfit,
};

