const prisma = require("../config/prisma");

// ======================================================
// CREATE PURCHASE
// ======================================================

const createPurchase = async ({
  supplierId,
  userId,
  items,
}) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Purchase must contain at least one item");
  }

  const result = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    // Check products and calculate total
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      if (!productId || !quantity || unitCost === undefined) {
        throw new Error(
          "productId, quantity and unitCost are required"
        );
      }

      if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      if (unitCost < 0) {
        throw new Error("Unit cost cannot be negative");
      }

      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      totalAmount += quantity * unitCost;
    }

    // Create purchase
    const purchase = await tx.purchases.create({
      data: {
        supplier_id: supplierId ? Number(supplierId) : null,
        user_id: userId ? Number(userId) : null,
        total_amount: totalAmount,
        purchase_datee: new Date(),
        created_at: new Date(),
      },
    });

    // Create purchase items + increase inventory
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      const totalCost = quantity * unitCost;

      // Create purchase item
      await tx.purchase_items.create({
        data: {
          purchase_id: purchase.id,
          product_id: productId,
          quantity,
          unit_cost: unitCost,
          total_cost: totalCost,
        },
      });

      // Increase inventory
      await tx.Inventory.upsert({
        where: {
          productId,
        },
        update: {
          quantity: {
            increment: quantity,
          },
          updatedAt: new Date(),
        },
        create: {
          productId,
          quantity,
        },
      });

      // Record inventory movement
      await tx.InventoryMovement.create({
        data: {
          productId,
          quantity,
          type: "IN",
          reference: `PURCHASE-${purchase.id}`,
        },
      });
    }

    return purchase;
  });

  return result;
};


// ======================================================
// GET ALL PURCHASES
// ======================================================

const getPurchases = async () => {
  const purchases = await prisma.purchases.findMany({
    include: {
      suppliers: true,
      users: true,
      purchase_items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return purchases;
};


// ======================================================
// GET PURCHASE BY ID
// ======================================================

const getPurchaseById = async (id) => {
  const purchaseId = Number(id);

  if (!purchaseId) {
    throw new Error("Invalid purchase ID");
  }

  const purchase = await prisma.purchases.findUnique({
    where: {
      id: purchaseId,
    },
    include: {
      suppliers: true,
      users: true,
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


// ======================================================
// UPDATE PURCHASE
// ======================================================

const updatePurchase = async (
  id,
  {
    supplierId,
    userId,
    items,
  }
) => {
  const purchaseId = Number(id);

  if (!purchaseId) {
    throw new Error("Invalid purchase ID");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Purchase must contain at least one item");
  }

  const result = await prisma.$transaction(async (tx) => {

    // ------------------------------------------
    // 1. Find existing purchase
    // ------------------------------------------

    const existingPurchase =
      await tx.purchases.findUnique({
        where: {
          id: purchaseId,
        },
        include: {
          purchase_items: true,
        },
      });

    if (!existingPurchase) {
      throw new Error("Purchase not found");
    }


    // ------------------------------------------
    // 2. Reverse old inventory
    // ------------------------------------------

    for (const oldItem of existingPurchase.purchase_items) {

      if (!oldItem.product_id || !oldItem.quantity) {
        continue;
      }

      const inventory =
        await tx.Inventory.findUnique({
          where: {
            productId: oldItem.product_id,
          },
        });

      if (!inventory) {
        throw new Error(
          `Inventory not found for product ${oldItem.product_id}`
        );
      }

      if (inventory.quantity < oldItem.quantity) {
        throw new Error(
          `Cannot update purchase. Product ${oldItem.product_id} does not have enough stock`
        );
      }

      await tx.Inventory.update({
        where: {
          productId: oldItem.product_id,
        },
        data: {
          quantity: {
            decrement: oldItem.quantity,
          },
          updatedAt: new Date(),
        },
      });

      // Record reverse movement
      await tx.InventoryMovement.create({
        data: {
          productId: oldItem.product_id,
          quantity: oldItem.quantity,
          type: "OUT",
          reference: `PURCHASE-UPDATE-OLD-${purchaseId}`,
        },
      });
    }


    // ------------------------------------------
    // 3. Delete old purchase items
    // ------------------------------------------

    await tx.purchase_items.deleteMany({
      where: {
        purchase_id: purchaseId,
      },
    });


    // ------------------------------------------
    // 4. Validate new items
    // ------------------------------------------

    let totalAmount = 0;

    for (const item of items) {

      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      if (!productId || !quantity || unitCost === undefined) {
        throw new Error(
          "productId, quantity and unitCost are required"
        );
      }

      if (quantity <= 0) {
        throw new Error(
          "Quantity must be greater than 0"
        );
      }

      if (unitCost < 0) {
        throw new Error(
          "Unit cost cannot be negative"
        );
      }

      const product =
        await tx.product.findUnique({
          where: {
            id: productId,
          },
        });

      if (!product) {
        throw new Error(
          `Product ${productId} not found`
        );
      }

      totalAmount += quantity * unitCost;
    }


    // ------------------------------------------
    // 5. Update purchase
    // ------------------------------------------

    const updatedPurchase =
      await tx.purchases.update({
        where: {
          id: purchaseId,
        },
        data: {
          supplier_id:
            supplierId ? Number(supplierId) : null,

          user_id:
            userId ? Number(userId) : null,

          total_amount: totalAmount,
        },
      });


    // ------------------------------------------
    // 6. Create new items + stock IN
    // ------------------------------------------

    for (const item of items) {

      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      const totalCost =
        quantity * unitCost;

      await tx.purchase_items.create({
        data: {
          purchase_id: purchaseId,
          product_id: productId,
          quantity,
          unit_cost: unitCost,
          total_cost: totalCost,
        },
      });


      // Increase inventory
      await tx.Inventory.upsert({
        where: {
          productId,
        },
        update: {
          quantity: {
            increment: quantity,
          },
          updatedAt: new Date(),
        },
        create: {
          productId,
          quantity,
        },
      });


      // Record movement
      await tx.InventoryMovement.create({
        data: {
          productId,
          quantity,
          type: "IN",
          reference: `PURCHASE-UPDATE-${purchaseId}`,
        },
      });
    }

    return updatedPurchase;
  });

  return result;
};


// ======================================================
// DELETE PURCHASE
// ======================================================

const deletePurchase = async (id) => {
  const purchaseId = Number(id);

  if (!purchaseId) {
    throw new Error("Invalid purchase ID");
  }

  const result = await prisma.$transaction(async (tx) => {

    // ------------------------------------------
    // 1. Find purchase
    // ------------------------------------------

    const purchase =
      await tx.purchases.findUnique({
        where: {
          id: purchaseId,
        },
        include: {
          purchase_items: true,
        },
      });

    if (!purchase) {
      throw new Error("Purchase not found");
    }


    // ------------------------------------------
    // 2. Reverse inventory
    // ------------------------------------------

    for (const item of purchase.purchase_items) {

      if (!item.product_id || !item.quantity) {
        continue;
      }

      const inventory =
        await tx.Inventory.findUnique({
          where: {
            productId: item.product_id,
          },
        });

      if (!inventory) {
        throw new Error(
          `Inventory not found for product ${item.product_id}`
        );
      }

      if (inventory.quantity < item.quantity) {
        throw new Error(
          `Cannot delete purchase. Product ${item.product_id} does not have enough stock`
        );
      }


      // Decrease inventory
      await tx.Inventory.update({
        where: {
          productId: item.product_id,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
          updatedAt: new Date(),
        },
      });


      // Record OUT movement
      await tx.InventoryMovement.create({
        data: {
          productId: item.product_id,
          quantity: item.quantity,
          type: "OUT",
          reference: `PURCHASE-DELETE-${purchaseId}`,
        },
      });
    }


    // ------------------------------------------
    // 3. Delete purchase items
    // ------------------------------------------

    await tx.purchase_items.deleteMany({
      where: {
        purchase_id: purchaseId,
      },
    });


    // ------------------------------------------
    // 4. Delete purchase
    // ------------------------------------------

    const deletedPurchase =
      await tx.purchases.delete({
        where: {
          id: purchaseId,
        },
      });

    return deletedPurchase;
  });

  return result;
};


// ======================================================
// EXPORT ALL FUNCTIONS
// ======================================================

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
};