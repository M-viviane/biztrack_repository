const prisma = require("../config/prisma");

const getDashboard = async () => {
  // Total products (retired products are not counted)
  const totalProducts = await prisma.product.count({
    where: {
      isActive: true,
    },
  });

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

  // Get inventory records of active products only, so retired products
  // do not add to stock totals or trigger low-stock alerts
  const inventory = await prisma.inventory.findMany({
    where: {
      product: {
        isActive: true,
      },
    },
    select: {
      quantity: true,
    },
  });

  // Total stock
  const totalStock = inventory.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Low stock
  const lowStockProducts = inventory.filter(
    (item) => item.quantity <= 5,
  ).length;

  const highStockProducts = inventory.filter(
    (item) => item.quantity > 5,
  ).length;

  return {
    totalProducts,
    totalSales,
    totalRevenue,
    totalExpenses,
    profit,
    totalStock,
    lowStockProducts,
    highStockProducts,
  };
};

module.exports = {
  getDashboard,
};
