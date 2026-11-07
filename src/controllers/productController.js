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

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    // Admins can also see retired products (isActive: false),
    // so they can decide whether to restore one.
    const includeRetired = Boolean(req.user && req.user.role === "ADMIN");

    const product = await productService.getProductById(id, { includeRetired });

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

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await productService.updateProduct(id, req.body);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE - Delete product
const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await productService.deleteProduct(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product retired successfully",
      product,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// PATCH - Restore a retired product
const restoreProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await productService.restoreProduct(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product restored successfully",
      product,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: "Failed to restore product",
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
  restoreProduct,
};
