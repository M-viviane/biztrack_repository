const prisma = require("../config/prisma");

// CREATE PRODUCT
const createProduct = async (data) => {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category_id: data.category_id ? Number(data.category_id) : null,
      cost_price: data.cost_price ? Number(data.cost_price) : null,
      selling_price: data.selling_price ? Number(data.selling_price) : null,
      unit: data.unit,
      description: data.description,
      isActive: true,
    },
  });

  return product;
};

// GET ALL ACTIVE PRODUCTS
const getProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return products;
};

// GET PRODUCT BY ID
// Retired products are hidden unless includeRetired is true
// (used for admins, so they can look one up before restoring it).
const getProductById = async (id, { includeRetired = false } = {}) => {
  const where = { id: Number(id) };

  if (!includeRetired) {
    where.isActive = true;
  }

  const product = await prisma.product.findUnique({
    where,
  });

  return product;
};

// Builds the update data from ONLY the fields that were sent.
// A field that is missing from the request (undefined) is left unchanged,
// so updating just the name keeps the prices, SKU and category.
// `!== undefined` (not a truthiness check) means a price of 0 is kept as 0.
const buildProductUpdate = (data) => {
  const update = {};

  const textFields = ["name", "sku", "unit", "description"];
  const numberFields = ["category_id", "cost_price", "selling_price"];

  for (const field of textFields) {
    if (data[field] !== undefined) {
      update[field] = data[field];
    }
  }

  for (const field of numberFields) {
    if (data[field] !== undefined) {
      update[field] = data[field] === null ? null : Number(data[field]);
    }
  }

  return update;
};

const retiredProductError = () => {
  const error = new Error("Product is retired and cannot be edited");
  error.statusCode = 409;
  return error;
};

// UPDATE PRODUCT
// Returns null when no product has this id.
// Retired (inactive) products cannot be edited (409).
const updateProduct = async (id, data) => {
  const productId = Number(id);
  const update = buildProductUpdate(data);

  // Nothing to change: just report the product's current state.
  if (Object.keys(update).length === 0) {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return null;
    }

    if (!existing.isActive) {
      throw retiredProductError();
    }

    return existing;
  }

  // One conditional write: the database only updates the row if it is
  // still active at that moment. There is no gap between "check" and
  // "update" for a DELETE to slip into.
  const result = await prisma.product.updateMany({
    where: {
      id: productId,
      isActive: true,
    },
    data: update,
  });

  if (result.count === 0) {
    // Nothing was updated: find out why, to answer 404 or 409.
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return null;
    }

    throw retiredProductError();
  }

  // Return the product as it is now saved.
  return prisma.product.findUnique({
    where: { id: productId },
  });
};

// Switches a product between active and retired with ONE conditional
// write: the row only changes if it is still in the starting state.
// - changed          -> returns the product
// - no such product  -> returns null (404)
// - already in the target state -> throws a 409, and nothing is written
const setProductActive = async (id, isActive, alreadyMessage) => {
  const productId = Number(id);

  try {
    // ONE database call on success: change the row only if it is still
    // in the starting state, and get the updated product back.
    return await prisma.product.update({
      where: {
        id: productId,
        isActive: !isActive,
      },
      data: {
        isActive,
      },
    });
  } catch (error) {
    // P2025 means Prisma did not find a matching product.
    if (error.code !== "P2025") {
      throw error;
    }

    // Check whether the product exists.
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return null;
    }

    // The product exists, but its status is already what was requested.
    const conflictError = new Error(alreadyMessage);
    conflictError.statusCode = 409;
    throw conflictError;
  }
};

// DELETE PRODUCT (SOFT DELETE)
// The row is kept so past sales and purchases still point to it.
// Returns null when no product has this id; 409 if already retired.
const deleteProduct = async (id) =>
  setProductActive(id, false, "Product is already retired");

// RESTORE PRODUCT (UNDO SOFT DELETE)
// Brings a retired product back so it can be sold and purchased again.
// Returns null when no product has this id; 409 if already active.
const restoreProduct = async (id) =>
  setProductActive(id, true, "Product is already active");

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct,
};
