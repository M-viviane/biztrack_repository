const prisma = require("../config/prisma");

const createProduct = async (data) => {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category_id: data.category_id,
      cost_price: data.cost_price,
      selling_price: data.selling_price,
      unit: data.unit,
      description: data.description,
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
      category_id: data.category_id,
      cost_price: data.cost_price,
      selling_price: data.selling_price,
      unit: data.unit,
      description: data.description,
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