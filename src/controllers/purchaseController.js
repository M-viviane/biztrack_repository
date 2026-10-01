const purchaseService = require("../services/purchaseService");

const createPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.createPurchase(req.body);

    res.status(201).json({
      message: "Purchase created successfully",
      purchase,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPurchase,
};