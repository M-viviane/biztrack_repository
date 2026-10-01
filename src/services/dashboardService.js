const prisma = require("../config/prisma");

const getDashboard = async () => {
  // Total products
  const totalProducts = await prisma.product.count();

  // Total sales
  const totalSales = await prisma.sales.count();

  // Total revenue
  const revenueResult = await prisma.sales.aggregate({
    _sum: {
      total_amount: true,
    },
  });

  const totalRevenue = Number(revenueResult._sum.total_amount || 0);

  // Total expenses
  const expenseResult = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });

  const totalExpenses = Number(expenseResult._sum.amount || 0);

  // Profit
  const profit = totalRevenue - totalExpenses;

  // Get all inventory records
  const inventory = await prisma.inventory.findMany({
    select: {
      quantity: true,
    },
  });

  // Total stock
  const totalStock = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Low stock
  const lowStockProducts = inventory.filter(
    (item) => item.quantity <= 5
  ).length;

  return {
    totalProducts,
    totalSales,
    totalRevenue,
    totalExpenses,
    profit,
    totalStock,
    lowStockProducts,
  };
};

module.exports = {
  getDashboard,
};