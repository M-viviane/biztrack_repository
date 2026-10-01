const prisma = require("../config/prisma");

// =========================
// CREATE CATEGORY
// =========================
const createCategory = async (data) => {
  if (!data.name) {
    throw new Error("Category name is required");
  }

  const category = await prisma.categories.create({
    data: {
      name: data.name,
      description: data.description || null,
      created_at: new Date(),
    },
  });

  return category;
};

// =========================
// GET ALL CATEGORIES
// =========================
const getCategories = async () => {
  const categories = await prisma.categories.findMany({
    include: {
      product: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return categories;
};

// =========================
// GET CATEGORY BY ID
// =========================
const getCategoryById = async (id) => {
  const category = await prisma.categories.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      product: true,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// =========================
// UPDATE CATEGORY
// =========================
const updateCategory = async (id, data) => {
  const existingCategory = await prisma.categories.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const category = await prisma.categories.update({
    where: {
      id: Number(id),
    },
    data: {
      name: data.name,
      description: data.description,
    },
  });

  return category;
};

// =========================
// DELETE CATEGORY
// =========================
const deleteCategory = async (id) => {
  const existingCategory = await prisma.categories.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      product: true,
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  if (existingCategory.product.length > 0) {
    throw new Error(
      "Cannot delete category because it has products"
    );
  }

  const category = await prisma.categories.delete({
    where: {
      id: Number(id),
    },
  });

  return category;
};

// =========================
// EXPORT
// =========================
module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};