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


// UPDATE PRODUCT
// Returns null when no product has this id.
// Retired (inactive) products cannot be edited.
const updateProduct = async (id, data) => {
  const existing = await prisma.product.findUnique({
    where: {
      id: Number(id)
    }
  });

  if (!existing) {
    return null;
  }

  if (!existing.isActive) {
    const error = new Error("Product is retired and cannot be edited");
    error.statusCode = 409;
    throw error;
  }

  const product = await prisma.product.update({
    where: {
      id: Number(id)
    },
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
      description: data.description
    }
  });

  return product;
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


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};