const prisma = require("../config/prisma");

const createProduct = async (data) => {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      description: data.description,
      unitCost: data.unitCost,
      sellingPrice: data.sellingPrice,
      quantity: data.quantity || 0,
    },
  });

  return product;
};


// GET all products
const getProducts = async () => {
  const products = await prisma.product.findMany();

  return products;
};


// GET one product
const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
  });

  return product;
};


// PUT / UPDATE product
const updateProduct = async (id, data) => {
  const product = await prisma.product.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
      sku: data.sku,
      description: data.description,
      unitCost: data.unitCost,
      sellingPrice: data.sellingPrice,
      quantity: data.quantity,
    },
  });

  return product;
};


// DELETE product
const deleteProduct = async (id) => {
  const product = await prisma.product.delete({
    where: {
      id: id,
    },
  });

  return product;
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};