const categoryService = require("../services/categoryService");

// =========================
// CREATE CATEGORY
// =========================
const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// =========================
// GET ALL CATEGORIES
// =========================
const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getCategories();

    res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// GET CATEGORY BY ID
// =========================
const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(
      req.params.id
    );

    res.status(200).json({
      category,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// =========================
// UPDATE CATEGORY
// =========================
const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// =========================
// DELETE CATEGORY
// =========================
const deleteCategory = async (req, res) => {
  try {
    const category = await categoryService.deleteCategory(
      req.params.id
    );

    res.status(200).json({
      message: "Category deleted successfully",
      category,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};