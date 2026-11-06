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

const fakeInventoryModel = {
  findUnique: async ({ where }) => ({ productId: where.productId, quantity: 10 }),
  update: async ({ where }) => {
    calls.push({ method: "inventory.update", where });
    return { productId: where.productId, quantity: 9 };
  },
  upsert: async ({ where }) => {
    calls.push({ method: "inventory.upsert", where });
    return { productId: where.productId, quantity: 11 };
  },
};

const fakeMovementModel = {
  create: async ({ data }) => data,
};

const fakeModels = {
  product: fakeProductModel,
  inventory: fakeInventoryModel,
  inventoryMovement: fakeMovementModel,
};

const fakePrisma = {
  ...fakeModels,
  // Sales, purchases and stock-out run inside a transaction; give them the same fakes.
  $transaction: async (fn) => fn(fakeModels),
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
const inventoryService = require("../src/services/inventoryService");

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

// ---- Retired products cannot be edited ----------------------------------
test("PUT on a retired product returns 409 and changes nothing", async () => {
  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "2" }, body: { name: "New name" } },
    res
  );

  assert.equal(res.statusCode, 409);
  assert.equal(calls.length, 0);
  assert.equal(products.find((p) => p.id === 2).name, "Retired soap");
});

test("PUT on an unknown product returns 404", async () => {
  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "999" }, body: { name: "x" } },
    res
  );

  assert.equal(res.statusCode, 404);
  assert.equal(calls.length, 0);
});

test("PUT on an active product still works", async () => {
  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "1" }, body: { name: "Better soap" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.name, "Better soap");
});

// ---- Stock rules for retired products -----------------------------------
test("stock-in for a retired product is rejected", async () => {
  await assert.rejects(
    inventoryService.stockIn({ productId: 2, quantity: 5 }),
    /inactive/
  );
  assert.equal(calls.length, 0);
});

test("stock-out for a retired product is still allowed (write off leftovers)", async () => {
  const result = await inventoryService.stockOut({ productId: 2, quantity: 1 });
  assert.equal(result.movement.type, "OUT");
});

// ---- Restoring a retired product ----------------------------------------
test("PATCH restore brings a retired product back with update", async () => {
  const res = fakeRes();
  await productController.restoreProduct({ params: { id: "2" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.product.isActive, true);
  assert.deepEqual(calls, [
    { method: "update", where: { id: 2 }, data: { isActive: true } },
  ]);
});

test("PATCH restore returns 404 for an unknown id", async () => {
  const res = fakeRes();
  await productController.restoreProduct({ params: { id: "999" } }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(calls.length, 0);
});

test("PATCH restore returns 400 for an id that is not a number", async () => {
  const res = fakeRes();
  await productController.restoreProduct({ params: { id: "abc" } }, res);

  assert.equal(res.statusCode, 400);
});

test("full cycle: retire -> blocked -> restore -> usable again", async () => {
  await productController.deleteProduct({ params: { id: "1" } }, fakeRes());
  await assert.rejects(
    inventoryService.stockIn({ productId: 1, quantity: 5 }),
    /inactive/
  );

  await productController.restoreProduct({ params: { id: "1" } }, fakeRes());

  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "1" }, body: { name: "Back again" } },
    res
  );
  assert.equal(res.statusCode, 200);
  await inventoryService.stockIn({ productId: 1, quantity: 5 });
});

test("restore route is PATCH /:id/restore and is protected", () => {
  const router = require("../src/routes/productRoutes");
  const layer = router.stack.find((l) => l.route && l.route.path === "/:id/restore");

  assert.ok(layer, "route /:id/restore exists");
  assert.equal(layer.route.methods.patch, true);
  // auth middleware + role middleware + controller
  assert.equal(layer.route.stack.length, 3);
});
