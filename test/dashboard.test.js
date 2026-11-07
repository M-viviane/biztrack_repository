// Review fix 4: retired products must not appear in dashboard totals
// or low-stock alerts. Uses a fake Prisma client (no real database).

const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const products = [
  { id: 1, isActive: true },
  { id: 2, isActive: true },
  { id: 3, isActive: false }, // retired
];

const inventory = [
  { productId: 1, quantity: 20 }, // active, plenty of stock
  { productId: 2, quantity: 3 }, // active, low stock
  { productId: 3, quantity: 1 }, // retired, low stock: must be ignored
];

const queries = {};

// Applies the same filters the real database would.
const matchesProduct = (product, where = {}) =>
  Object.entries(where).every(([key, value]) => product[key] === value);

const fakePrisma = {
  product: {
    count: async (args = {}) => {
      queries.productCount = args;
      return products.filter((p) => matchesProduct(p, args.where)).length;
    },
  },
  inventory: {
    findMany: async (args = {}) => {
      queries.inventoryFindMany = args;
      const productFilter = args.where && args.where.product;
      return inventory
        .filter((item) =>
          matchesProduct(
            products.find((p) => p.id === item.productId),
            productFilter,
          ),
        )
        .map((item) => ({ quantity: item.quantity }));
    },
  },
  sales: {
    count: async () => 0,
    aggregate: async () => ({ _sum: { total_amount: 0 } }),
  },
  expense: {
    aggregate: async () => ({ _sum: { amount: 0 } }),
  },
};

const prismaPath = path.join(__dirname, "..", "src", "config", "prisma.js");
require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: fakePrisma,
};

const dashboardService = require("../src/services/dashboardService");

test("product count only counts active products", async () => {
  const dashboard = await dashboardService.getDashboard();

  assert.deepEqual(queries.productCount, { where: { isActive: true } });
  assert.equal(dashboard.totalProducts, 2);
});

test("inventory is filtered to active products through the product relation", async () => {
  await dashboardService.getDashboard();

  assert.deepEqual(queries.inventoryFindMany.where, {
    product: { isActive: true },
  });
});

test("retired stock is left out of totals and low-stock alerts", async () => {
  const dashboard = await dashboardService.getDashboard();

  assert.equal(dashboard.totalStock, 23); // 20 + 3, the retired 1 is left out
  assert.equal(dashboard.lowStockProducts, 1); // only product 2
  assert.equal(dashboard.highStockProducts, 1);
});

test("the dashboard response keeps the same fields", async () => {
  const dashboard = await dashboardService.getDashboard();

  assert.deepEqual(Object.keys(dashboard).sort(), [
    "highStockProducts",
    "lowStockProducts",
    "profit",
    "totalExpenses",
    "totalProducts",
    "totalRevenue",
    "totalSales",
    "totalStock",
  ]);
});
