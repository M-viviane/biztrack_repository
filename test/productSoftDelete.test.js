// BT-003: retiring a product must keep it in the database (soft delete),
// return 404 for unknown ids, and block it from new sales and purchases.
//
// These tests use a fake Prisma client so they never touch a real database.

const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

// ---- Fake Prisma client -------------------------------------------------
let products;
let calls;

const fakeProductModel = {
  findUnique: async ({ where }) => products.find((p) => p.id === where.id) || null,
  update: async ({ where, data }) => {
    calls.push({ method: "update", where, data });
    const product = products.find((p) => p.id === where.id);
    Object.assign(product, data);
    return product;
  },
  delete: async (args) => {
    calls.push({ method: "delete", args });
    throw new Error("delete must not be used for products");
  },
};

const fakePrisma = {
  product: fakeProductModel,
  // Sales and purchases run inside a transaction; give them the same fake.
  $transaction: async (fn) => fn({ product: fakeProductModel }),
};

// Put the fake in Node's module cache before any service loads the real one.
const prismaPath = path.join(__dirname, "..", "src", "config", "prisma.js");
require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: fakePrisma,
};

const productService = require("../src/services/productService");
const productController = require("../src/controllers/productController");
const saleService = require("../src/services/saleService");
const purchaseService = require("../src/services/purchaseService");

// Minimal stand-in for Express's res object.
const fakeRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

beforeEach(() => {
  products = [
    { id: 1, name: "Active soap", isActive: true, selling_price: 500 },
    { id: 2, name: "Retired soap", isActive: false, selling_price: 500 },
  ];
  calls = [];
});

// ---- Criterion 1: DELETE sets isActive=false via update -----------------
test("DELETE retires the product with update, not delete", async () => {
  const res = fakeRes();
  await productController.deleteProduct({ params: { id: "1" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.product.isActive, false);
  assert.deepEqual(calls, [
    { method: "update", where: { id: 1 }, data: { isActive: false } },
  ]);
  // The row still exists, so past sales can still reference it.
  assert.ok(products.find((p) => p.id === 1));
});

// ---- Criterion 2: 404 for an unknown id ---------------------------------
test("DELETE returns 404 for an unknown id", async () => {
  const res = fakeRes();
  await productController.deleteProduct({ params: { id: "999" } }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(calls.length, 0);
});

test("DELETE returns 400 for an id that is not a number", async () => {
  const res = fakeRes();
  await productController.deleteProduct({ params: { id: "abc" } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 0);
});

test("service returns null for an unknown id", async () => {
  assert.equal(await productService.deleteProduct(999), null);
});

// ---- Criterion 3: inactive products are blocked -------------------------
test("a new sale with an inactive product is rejected", async () => {
  await assert.rejects(
    saleService.createSale({ userId: 1, items: [{ productId: 2, quantity: 1 }] }),
    /inactive/
  );
});

test("a new purchase with an inactive product is rejected", async () => {
  await assert.rejects(
    purchaseService.createPurchase({
      supplierId: 1,
      userId: 1,
      items: [{ productId: 2, quantity: 1, unitCost: 100 }],
    }),
    /inactive/
  );
});
