// BT-003: retiring a product must keep it in the database (soft delete),
// return 404 for unknown ids, and block it from new sales and purchases.
//
// These tests use a fake Prisma client so they never touch a real database.

const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

// The routes load authMiddleware, which loads src/config/env.js. That
// checks the config straight away, so give it safe test values. This
// way the tests also pass on a fresh clone or in CI, with no .env file.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET ??= "x".repeat(32);

// ---- Fake Prisma client -------------------------------------------------
let products;
let calls;

const fakeProductModel = {
  // Like the real database: every condition in `where` must match
  // (e.g. id AND isActive).
  findUnique: async ({ where }) =>
    products.find((p) =>
      Object.entries(where).every(([key, value]) => p[key] === value),
    ) || null,
  // Like real Prisma: every condition in `where` must match, otherwise
  // it throws error P2025. Records a call only if a row changed.
  update: async ({ where, data }) => {
    const product = products.find((p) =>
      Object.entries(where).every(([key, value]) => p[key] === value),
    );
    if (!product) {
      const error = new Error("No record was found for an update.");
      error.code = "P2025";
      throw error;
    }
    calls.push({ method: "update", where, data });
    Object.assign(product, data);
    return product;
  },
  // Like the real database: only rows matching EVERY condition in `where`
  // (e.g. id AND isActive) are changed. Records a call only if a row changed.
  updateMany: async ({ where, data }) => {
    const matches = products.filter((p) =>
      Object.entries(where).every(([key, value]) => p[key] === value),
    );
    if (matches.length > 0) calls.push({ method: "updateMany", where, data });
    matches.forEach((p) => Object.assign(p, data));
    return { count: matches.length };
  },
  delete: async (args) => {
    calls.push({ method: "delete", args });
    throw new Error("delete must not be used for products");
  },
};

// Sales tables: remember what was saved so tests can check it.
let savedSales;
const fakeSalesModel = {
  create: async ({ data }) => {
    const sale = { id: savedSales.length + 1, ...data };
    savedSales.push(sale);
    return sale;
  },
};
const fakeSaleItemsModel = {
  create: async ({ data }) => data,
};

const fakeInventoryModel = {
  findUnique: async ({ where }) => ({
    productId: where.productId,
    quantity: 10,
  }),
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
  sales: fakeSalesModel,
  sale_items: fakeSaleItemsModel,
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
const saleController = require("../src/controllers/saleController");

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
    {
      id: 1,
      name: "Active soap",
      sku: "SOAP-1",
      category_id: 3,
      cost_price: 300,
      selling_price: 500,
      unit: "bar",
      description: "Lavender",
      isActive: true,
    },
    { id: 2, name: "Retired soap", isActive: false, selling_price: 500 },
  ];
  calls = [];
  savedSales = [];
});

// ---- Criterion 1: DELETE sets isActive=false via update -----------------
test("DELETE retires the product with update, not delete", async () => {
  const res = fakeRes();
  await productController.deleteProduct({ params: { id: "1" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.product.isActive, false);
  assert.deepEqual(calls, [
    {
      method: "update",
      where: { id: 1, isActive: true },
      data: { isActive: false },
    },
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
    saleService.createSale({
      userId: 1,
      items: [{ productId: 2, quantity: 1 }],
    }),
    /inactive/,
  );
});

test("a new purchase with an inactive product is rejected", async () => {
  await assert.rejects(
    purchaseService.createPurchase({
      supplierId: 1,
      userId: 1,
      items: [{ productId: 2, quantity: 1, unitCost: 100 }],
    }),
    /inactive/,
  );
});

// ---- Retired products cannot be edited ----------------------------------
test("PUT on a retired product returns 409 and changes nothing", async () => {
  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "2" }, body: { name: "New name" } },
    res,
  );

  assert.equal(res.statusCode, 409);
  assert.equal(calls.length, 0);
  assert.equal(products.find((p) => p.id === 2).name, "Retired soap");
});

test("PUT on an unknown product returns 404", async () => {
  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "999" }, body: { name: "x" } },
    res,
  );

  assert.equal(res.statusCode, 404);
  assert.equal(calls.length, 0);
});

test("PUT on an active product still works", async () => {
  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "1" }, body: { name: "Better soap" } },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.name, "Better soap");
});

// ---- Stock rules for retired products -----------------------------------
test("stock-in for a retired product is rejected", async () => {
  await assert.rejects(
    inventoryService.stockIn({ productId: 2, quantity: 5 }),
    /inactive/,
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
    {
      method: "update",
      where: { id: 2, isActive: false },
      data: { isActive: true },
    },
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
    /inactive/,
  );

  await productController.restoreProduct({ params: { id: "1" } }, fakeRes());

  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "1" }, body: { name: "Back again" } },
    res,
  );
  assert.equal(res.statusCode, 200);
  await inventoryService.stockIn({ productId: 1, quantity: 5 });
});

test("restore route is PATCH /:id/restore and is protected", () => {
  const router = require("../src/routes/productRoutes");
  const layer = router.stack.find(
    (l) => l.route && l.route.path === "/:id/restore",
  );

  assert.ok(layer, "route /:id/restore exists");
  assert.equal(layer.route.methods.patch, true);
  // auth middleware + role middleware + controller
  assert.equal(layer.route.stack.length, 3);
});

// ---- Review fix 1: no race between "check retired" and "update" ---------
test("PUT updates with ONE conditional write (id AND isActive: true)", async () => {
  await productService.updateProduct(1, { name: "Safer soap" });

  assert.deepEqual(calls, [
    {
      method: "updateMany",
      where: { id: 1, isActive: true },
      data: { name: "Safer soap" },
    },
  ]);
});

test("PUT is refused (409) even if a DELETE lands after an earlier read", async () => {
  // Simulate the race: an earlier read saw the product as active...
  const staleRead = { ...products[0] };
  // ...then a DELETE retired it before the update ran.
  products[0].isActive = false;
  const realFindUnique = fakeProductModel.findUnique;
  fakeProductModel.findUnique = async () => staleRead;

  try {
    await assert.rejects(
      productService.updateProduct(1, { name: "Too late" }),
      (error) => error.statusCode === 409,
    );
  } finally {
    fakeProductModel.findUnique = realFindUnique;
  }

  // The database row was not changed.
  assert.equal(products[0].name, "Active soap");
  assert.equal(calls.length, 0);
});

// ---- Review fix 2: partial updates keep the other fields ----------------
test("PUT with only a name keeps price, cost, SKU, category, unit, description", async () => {
  const res = fakeRes();
  await productController.updateProduct(
    { params: { id: "1" }, body: { name: "Renamed soap" } },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    id: 1,
    name: "Renamed soap",
    sku: "SOAP-1",
    category_id: 3,
    cost_price: 300,
    selling_price: 500,
    unit: "bar",
    description: "Lavender",
    isActive: true,
  });
});

test("PUT accepts a price of 0 and stores 0, not null", async () => {
  const product = await productService.updateProduct(1, {
    selling_price: 0,
    cost_price: "0",
  });

  assert.equal(product.selling_price, 0);
  assert.equal(product.cost_price, 0);
});

test("PUT converts number fields sent as text", async () => {
  const product = await productService.updateProduct(1, {
    selling_price: "750",
    category_id: "4",
  });

  assert.equal(product.selling_price, 750);
  assert.equal(product.category_id, 4);
  assert.equal(product.cost_price, 300); // not sent, so unchanged
});

test("PUT can still clear a field when null is sent on purpose", async () => {
  const product = await productService.updateProduct(1, { category_id: null });

  assert.equal(product.category_id, null);
  assert.equal(product.selling_price, 500);
});

test("PUT with an empty body changes nothing and returns the product", async () => {
  const product = await productService.updateProduct(1, {});

  assert.equal(product.name, "Active soap");
  assert.equal(calls.length, 0);
});

test("PUT with an empty body on a retired product still returns 409", async () => {
  await assert.rejects(
    productService.updateProduct(2, {}),
    (error) => error.statusCode === 409,
  );
});

test("a renamed product can still be sold (its price was kept)", async () => {
  await productService.updateProduct(1, { name: "Renamed soap" });
  const sale = await saleService.createSale({
    userId: 5,
    items: [{ productId: 1, quantity: 1 }],
  });

  assert.equal(sale.total_amount, 500);
});

// ---- Review fix 3: the seller comes from the login, not the body --------
test("createSale saves the logged-in user, ignoring userId in the body", async () => {
  const res = fakeRes();
  await saleController.createSale(
    {
      user: { id: 7, role: "STAFF" },
      body: { userId: 1, items: [{ productId: 1, quantity: 1 }] },
    },
    res,
  );

  assert.equal(res.statusCode, 201);
  assert.equal(savedSales.length, 1);
  assert.equal(savedSales[0].user_id, 7);
});

test("createSale without a user id is rejected and saves nothing", async () => {
  await assert.rejects(
    saleService.createSale({ items: [{ productId: 1, quantity: 1 }] }),
    /logged-in user is required/,
  );
  assert.equal(savedSales.length, 0);
});

// ---- Review item 5: GET /api/products/:id -------------------------------
test("GET returns 400 for an id that is not a number", async () => {
  const res = fakeRes();
  await productController.getProductById(
    { params: { id: "abc" }, user: { role: "ADMIN" } },
    res,
  );

  assert.equal(res.statusCode, 400);
});

test("GET lets an ADMIN look up a retired product", async () => {
  const res = fakeRes();
  await productController.getProductById(
    { params: { id: "2" }, user: { role: "ADMIN" } },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.isActive, false);
});

test("GET hides a retired product from MANAGER and STAFF (404)", async () => {
  for (const role of ["MANAGER", "STAFF"]) {
    const res = fakeRes();
    await productController.getProductById(
      { params: { id: "2" }, user: { role } },
      res,
    );
    assert.equal(res.statusCode, 404, role);
  }
});

test("GET still returns an active product to everyone", async () => {
  const res = fakeRes();
  await productController.getProductById(
    { params: { id: "1" }, user: { role: "STAFF" } },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.name, "Active soap");
});

// ---- Review: delete/restore are atomic and report no-ops ----------------
test("DELETE on an already retired product returns 409 and writes nothing", async () => {
  const res = fakeRes();
  await productController.deleteProduct({ params: { id: "2" } }, res);

  assert.equal(res.statusCode, 409);
  assert.match(res.body.error, /already retired/);
  assert.equal(calls.length, 0);
});

test("PATCH restore on an active product returns 409 and writes nothing", async () => {
  const res = fakeRes();
  await productController.restoreProduct({ params: { id: "1" } }, res);

  assert.equal(res.statusCode, 409);
  assert.match(res.body.error, /already active/);
  assert.equal(calls.length, 0);
});

test("DELETE never throws a 500 if the product vanishes mid-request", async () => {
  // update on a missing row throws Prisma error P2025. The service
  // catches it and returns null, which becomes a clean 404 (not a 500).
  const res = fakeRes();
  await productController.deleteProduct({ params: { id: "999" } }, res);

  assert.equal(res.statusCode, 404);
});

test("DELETE success uses only ONE database call", async () => {
  let findUniqueCalls = 0;
  const originalFind = fakeProductModel.findUnique;
  fakeProductModel.findUnique = async (args) => {
    findUniqueCalls += 1;
    return originalFind(args);
  };
  try {
    const res = fakeRes();
    await productController.deleteProduct({ params: { id: "1" } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(calls.length, 1); // the single update
    assert.equal(findUniqueCalls, 0); // no extra read-back
  } finally {
    fakeProductModel.findUnique = originalFind;
  }
});

test("a database error other than P2025 is not hidden", async () => {
  const originalUpdate = fakeProductModel.update;
  fakeProductModel.update = async () => {
    throw new Error("connection lost");
  };
  try {
    const res = fakeRes();
    await productController.deleteProduct({ params: { id: "1" } }, res);

    assert.equal(res.statusCode, 500);
  } finally {
    fakeProductModel.update = originalUpdate;
  }
});

// ---- Review: PORT comes from the environment ----------------------------
test("server.js reads PORT from the environment", () => {
  const fs = require("node:fs");
  const server = fs.readFileSync(
    path.join(__dirname, "..", "src", "server.js"),
    "utf8",
  );

  // Either process.env.PORT or the validated env.PORT (src/config/env.js).
  assert.match(server, /env\.PORT/);
  assert.doesNotMatch(server, /listen\(5000/);
});
