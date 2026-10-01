const prisma = require("../config/prisma");

// =========================
// STOCK IN
// =========================
const stockIn = async ({ productId, quantity, reference }) => {
  if (!productId || !quantity) {
    throw new Error("productId and quantity are required");
  }

  const productIdNumber = Number(productId);
  const quantityNumber = Number(quantity);

  if (quantityNumber <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: {
      id: productIdNumber,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Create inventory if it does not exist,
  // otherwise increase existing stock
  const inventory = await prisma.inventory.upsert({
    where: {
      productId: productIdNumber,
    },
    update: {
      quantity: {
        increment: quantityNumber,
      },
      updatedAt: new Date(),
    },
    create: {
      productId: productIdNumber,
      quantity: quantityNumber,
    },
  });

  // Record stock movement
  const movement = await prisma.inventoryMovement.create({
    data: {
      productId: productIdNumber,
      quantity: quantityNumber,
      type: "IN",
      reference: reference || null,
    },
  });

  return {
    inventory,
    movement,
  };
};

// =========================
// STOCK OUT
// =========================
const stockOut = async ({ productId, quantity, reference }) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!quantity || Number(quantity) <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const productIdNumber = Number(productId);
  const quantityNumber = Number(quantity);

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: {
      id: productIdNumber,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Transaction
  const result = await prisma.$transaction(async (tx) => {
    // Find inventory
    const inventory = await tx.inventory.findUnique({
      where: {
        productId: productIdNumber,
      },
    });

    if (!inventory) {
      throw new Error("Inventory record not found");
    }

    // Prevent negative stock
    if (inventory.quantity < quantityNumber) {
      throw new Error(
        `Insufficient stock. Available quantity: ${inventory.quantity}`
      );
    }

    // Decrease stock
    const updatedInventory = await tx.inventory.update({
      where: {
        productId: productIdNumber,
      },
      data: {
        quantity: {
          decrement: quantityNumber,
        },
        updatedAt: new Date(),
      },
    });

    // Record stock movement
    const movement = await tx.inventoryMovement.create({
      data: {
        productId: productIdNumber,
        quantity: quantityNumber,
        type: "OUT",
        reference: reference || null,
      },
    });

    return {
      inventory: updatedInventory,
      movement,
    };
  });

  return result;
};

// =========================
// GET ALL INVENTORY
// =========================
const getInventory = async () => {
  return await prisma.inventory.findMany({
    include: {
      product: true,
    },
    orderBy: {
      id: "desc",
    },
  });
};

// =========================
// GET INVENTORY BY PRODUCT
// =========================
const getInventoryByProduct = async (productId) => {
  const inventory = await prisma.inventory.findUnique({
    where: {
      productId: Number(productId),
    },
    include: {
      product: true,
    },
  });

  if (!inventory) {
    throw new Error("Inventory not found for this product");
  }

  return inventory;
};

// =========================
// GET ALL MOVEMENTS
// =========================
const getMovements = async () => {
  return await prisma.inventoryMovement.findMany({
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// =========================
// GET MOVEMENTS BY PRODUCT
// =========================
const getMovementsByProduct = async (productId) => {
  return await prisma.inventoryMovement.findMany({
    where: {
      productId: Number(productId),
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// =========================
// EXPORT
// =========================
module.exports = {
  stockIn,
  stockOut,
  getInventory,
  getInventoryByProduct,
  getMovements,
  getMovementsByProduct,
};