const productService = require("../services/productService");

// POST - Create product
const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};


// GET - Get all products
const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      error: error.message,
    });
  }
};


// GET - Get one product
const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
      error: error.message,
    });
  }
};


// PUT - Update product
const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await productService.updateProduct(id, req.body);

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};


// DELETE - Delete product
const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await productService.deleteProduct(id);

    res.status(200).json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};