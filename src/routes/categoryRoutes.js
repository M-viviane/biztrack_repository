const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/categoryController");

// Create category
router.post("/", categoryController.createCategory);

// Get all categories
router.get("/", categoryController.getCategories);

// Get category by ID
router.get("/:id", categoryController.getCategoryById);

// Update category
router.put("/:id", categoryController.updateCategory);

// Delete category
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;