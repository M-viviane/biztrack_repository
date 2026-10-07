const purchaseService = require("../services/purchaseService");

// CREATE
const createPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.createPurchase(req.body);

    res.status(201).json({
      message: "Purchase created successfully",
      purchase,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create purchase",
      error: error.message,
    });
  }
};


// GET ALL
const getPurchases = async (req, res) => {
  try {
    const purchases = await purchaseService.getPurchases();

    res.status(200).json({
      message: "Purchases retrieved successfully",
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get purchases",
      error: error.message,
    });
  }
};


// GET ONE
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await purchaseService.getPurchaseById(
      req.params.id
    );

    res.status(200).json({
      message: "Purchase retrieved successfully",
      purchase,
    });
  } catch (error) {
    res.status(404).json({
      message: "Purchase not found",
      error: error.message,
    });
  }
};


// UPDATE
const updatePurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.updatePurchase(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Purchase updated successfully",
      purchase,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update purchase",
      error: error.message,
    });
  }
};


// DELETE
const deletePurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.deletePurchase(
      req.params.id
    );

    res.status(200).json({
      message: "Purchase deleted successfully",
      purchase,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete purchase",
      error: error.message,
    });
  }
};


module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
};