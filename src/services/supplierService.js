const prisma = require("../config/prisma");

// CREATE SUPPLIER
const createSupplier = async ({ name, phone, email, address }) => {
  if (!name || !name.trim()) {
    throw new Error("Supplier name is required");
  }

  return await prisma.suppliers.create({
    data: {
      name: name.trim(),
      phone,
      email,
      address,
    },
  });
};

// GET ALL SUPPLIERS
const getSuppliers = async () => {
  return await prisma.suppliers.findMany({
    orderBy: {
       id: "asc" 
      },
  });
};

// GET ONE SUPPLIER
const getSupplierById = async (id) => {
  const supplier = await prisma.suppliers.findUnique({
    where: { id: Number(id) },
  });

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
};