const inventoryService = require("../services/inventoryService");
const prisma = require("../config/prisma");

// STOCK IN
const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reference } = req.body;

    const result = await inventoryService.stockIn({
      productId,
      quantity,
      reference,
    });

    res.status(201).json({
      message: "Stock added successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// STOCK OUT
const stockOut = async (req, res) => {
  try {
    const { productId, quantity, reference } = req.body;

    const result = await inventoryService.stockOut({
      productId,
      quantity,
      reference,
    });

    res.status(200).json({
      message: "Stock removed successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// GET CURRENT INVENTORY
const getInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      message: "Inventory retrieved successfully",
      inventory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET INVENTORY BY PRODUCT
const getInventoryByProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const inventory = await prisma.inventory.findUnique({
      where: {
        productId,
      },
      include: {
        product: true,
      },
    });

    if (!inventory) {
      return res.status(404).json({
        message: "Inventory not found for this product",
      });
    }

    res.status(200).json({
      inventory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL MOVEMENTS
const getMovements = async (req, res) => {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Inventory movements retrieved successfully",
      movements,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET MOVEMENTS BY PRODUCT
const getMovementsByProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        productId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Product inventory history retrieved successfully",
      movements,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  stockIn,
  stockOut,
  getInventory,
  getInventoryByProduct,
  getMovements,
  getMovementsByProduct,
};