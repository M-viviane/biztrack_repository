
const prisma = require("../config/prisma");

// ======================================
// CREATE PURCHASE
// ======================================
const createPurchase = async ({ supplierId, userId, items }) => {
  // Supplier and user are required
  if (!supplierId) {
    throw new Error("Supplier is required");
  }

  if (!userId) {
    throw new Error("User is required");
  }

  // Purchase must contain at least one item
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Purchase must contain at least one item");
  }

  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    // Validate products and calculate total purchase amount
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitCost) ||
        unitCost < 0
      ) {
        throw new Error("Invalid purchase item");
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      if (!product.isActive) {
        throw new Error(
          `Product ${productId} is inactive and cannot be purchased`
        );
      }

      totalAmount += quantity * unitCost;
    }

    // Verify that the supplier exists
    const supplier = await tx.suppliers.findUnique({
      where: { id: Number(supplierId) },
    });

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Verify that the user exists
    const user = await tx.users.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create the purchase and include supplier and user information
    const purchase = await tx.purchases.create({
      data: {
        supplier_id: Number(supplierId),
        user_id: Number(userId),
        total_amount: totalAmount,
        purchase_datee: new Date(),
        created_at: new Date(),
      },
      include: {
        suppliers: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role_id: true,
            roles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Create purchase items, increase stock, and record movements
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      await tx.purchase_items.create({
        data: {
          purchase_id: purchase.id,
          product_id: productId,
          quantity,
          unit_cost: unitCost,
          total_cost: quantity * unitCost,
        },
      });

      // Increase inventory
      await tx.Inventory.upsert({
        where: { productId },
        update: {
          quantity: {
            increment: quantity,
          },
        },
        create: {
          productId,
          quantity,
        },
      });

      // Record stock movement
      await tx.InventoryMovement.create({
        data: {
          productId,
          quantity,
          type: "IN",
          reference: `PURCHASE-${purchase.id}`,
        },
      });
    }

    // Return purchase with supplier and user information
    return purchase;
  });
};

// ======================================
// GET ALL PURCHASES
// ======================================
const getPurchases = async () => {
  return await prisma.purchases.findMany({
    include: {
      suppliers: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role_id: true,
          roles: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      purchase_items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
};

// ======================================
// GET PURCHASE BY ID
// ======================================
const getPurchaseById = async (id) => {
  const purchaseId = Number(id);

  if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
    throw new Error("Invalid purchase ID");
  }

  const purchase = await prisma.purchases.findUnique({
    where: {
      id: purchaseId,
    },
    include: {
      suppliers: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role_id: true,
          roles: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      purchase_items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new Error("Purchase not found");
  }

  return purchase;
};

// ======================================
// UPDATE PURCHASE
// ======================================
const updatePurchase = async (id, data) => {
  const purchaseId = Number(id);

  if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
    throw new Error("Invalid purchase ID");
  }

  const purchase = await prisma.purchases.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase) {
    throw new Error("Purchase not found");
  }

  if (!data.supplierId) {
    throw new Error("Supplier is required");
  }

  if (!data.userId) {
    throw new Error("User is required");
  }

  // Verify supplier and user exist
  const supplier = await prisma.suppliers.findUnique({
    where: { id: Number(data.supplierId) },
  });

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  const user = await prisma.users.findUnique({
    where: { id: Number(data.userId) },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.purchases.update({
    where: { id: purchaseId },
    data: {
      supplier_id: Number(data.supplierId),
      user_id: Number(data.userId),
    },
    include: {
      suppliers: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role_id: true,
          roles: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

// ======================================
// DELETE PURCHASE
// ======================================
const deletePurchase = async (id) => {
  const purchaseId = Number(id);

  if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
    throw new Error("Invalid purchase ID");
  }

  const purchase = await prisma.purchases.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase) {
    throw new Error("Purchase not found");
  }

  return await prisma.$transaction(async (tx) => {
    // Delete related purchase items first
    await tx.purchase_items.deleteMany({
      where: { purchase_id: purchaseId },
    });

    // Delete the purchase record
    return await tx.purchases.delete({
      where: { id: purchaseId },
    });
  });
};

// ======================================
// EXPORT FUNCTIONS
// ======================================
module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
};

