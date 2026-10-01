const prisma = require("../config/prisma");

// =========================
// CREATE SALE
// =========================
const createSale = async ({ userId, items }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Sale must contain at least one item");
  }

  const result = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    // Check products, prices and stock
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!productId || !quantity) {
        throw new Error("productId and quantity are required");
      }

      if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      if (product.selling_price === null) {
        throw new Error(
          `Selling price is not set for product ${productId}`
        );
      }

      const inventory = await tx.inventory.findUnique({
        where: {
          productId,
        },
      });

      if (!inventory) {
        throw new Error(
          `Inventory not found for product ${productId}`
        );
      }

      if (inventory.quantity < quantity) {
        throw new Error(
          `Insufficient stock for product ${productId}. Available quantity: ${inventory.quantity}`
        );
      }

      const sellingPrice = Number(product.selling_price);

      totalAmount += quantity * sellingPrice;
    }

    // Create sale
    const sale = await tx.sales.create({
      data: {
        user_id: userId ? Number(userId) : null,
        total_amount: totalAmount,
        sale_date: new Date(),
        created_at: new Date(),
      },
    });

    // Create sale items and decrease stock
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      const sellingPrice = Number(product.selling_price);
      const subtotal = quantity * sellingPrice;

      // Create sale item
      await tx.sale_items.create({
        data: {
          sale_id: sale.id,
          product_id: productId,
          quantity,
          unit_price: sellingPrice,
          total_price: subtotal,
        },
      });

      // Decrease inventory
      await tx.inventory.update({
        where: {
          productId,
        },
        data: {
          quantity: {
            decrement: quantity,
          },
          updatedAt: new Date(),
        },
      });

      // Record stock OUT movement
      await tx.inventoryMovement.create({
        data: {
          productId,
          quantity,
          type: "OUT",
          reference: `SALE-${sale.id}`,
        },
      });
    }

    return sale;
  });

  return result;
};

// =========================
// GET ALL SALES
// =========================
const getSales = async () => {
  return await prisma.sales.findMany({
    include: {
      sale_items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
};

// =========================
// GET SALE BY ID
// =========================
const getSaleById = async (id) => {
  const sale = await prisma.sales.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      sale_items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  return sale;
};

// =========================
// EXPORT
// =========================
module.exports = {
  createSale,
  getSales,
  getSaleById,
};