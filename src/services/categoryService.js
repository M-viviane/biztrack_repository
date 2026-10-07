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
      isActive: true,
    },
  });

  return category;
};


// =========================
// GET ALL ACTIVE CATEGORIES
// =========================

const getCategories = async () => {
  const categories = await prisma.categories.findMany({
    where: {
      isActive: true,
    },
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
  const category = await prisma.categories.findFirst({
    where: {
      id: Number(id),
      isActive: true,
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
  const existingCategory = await prisma.categories.findFirst({
    where: {
      id: Number(id),
      isActive: true,
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
// SOFT DELETE
// =========================

const deleteCategory = async (id) => {
  const existingCategory = await prisma.categories.findFirst({
    where: {
      id: Number(id),
      isActive: true,
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
      isActive: false,
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