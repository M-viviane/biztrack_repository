const prisma = require("../config/prisma");

// CREATE PRODUCT
const createProduct = async (data) => {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category_id: data.category_id
        ? Number(data.category_id)
        : null,
      cost_price: data.cost_price
        ? Number(data.cost_price)
        : null,
      selling_price: data.selling_price
        ? Number(data.selling_price)
        : null,
      unit: data.unit,
      description: data.description,
      isActive: true
    }
  });

  return product;
};


// GET ALL ACTIVE PRODUCTS
const getProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      id: "asc"
    }
  });

  return products;
};


// GET PRODUCT BY ID
const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
      isActive: true
    }
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
      where: { id: productId }
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
      isActive: true
    },
    data: update
  });

  if (result.count === 0) {
    // Nothing was updated: find out why, to answer 404 or 409.
    const existing = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existing) {
      return null;
    }

    throw retiredProductError();
  }

  // Return the product as it is now saved.
  return prisma.product.findUnique({
    where: { id: productId }
  });
};


// DELETE PRODUCT (SOFT DELETE)
// The row is kept so past sales and purchases still point to it.
// Returns null when no product has this id.
const deleteProduct = async (id) => {
  const existing = await prisma.product.findUnique({
    where: {
      id: Number(id)
    }
  });

  if (!existing) {
    return null;
  }

  const product = await prisma.product.update({
    where: {
      id: Number(id)
    },
    data: {
      isActive: false
    }
  });

  return product;
};


// RESTORE PRODUCT (UNDO SOFT DELETE)
// Brings a retired product back so it can be sold and purchased again.
// Returns null when no product has this id.
const restoreProduct = async (id) => {
  const existing = await prisma.product.findUnique({
    where: {
      id: Number(id)
    }
  });

  if (!existing) {
    return null;
  }

  const product = await prisma.product.update({
    where: {
      id: Number(id)
    },
    data: {
      isActive: true
    }
  });

  return product;
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct
};