const prisma = require("../config/prisma");

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

      if (!productId || !quantity || !unitCost) {
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
      await tx.inventory.upsert({
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
      await tx.inventoryMovement.create({
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

module.exports = {
  createPurchase,
};