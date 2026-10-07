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
  const product = await prisma.product.findFirst({
    where: {
      id: Number(id),
      isActive: true
    }
  });

  return product;
};


// UPDATE PRODUCT
const updateProduct = async (id, data) => {
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
const deleteProduct = async (id) => {
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