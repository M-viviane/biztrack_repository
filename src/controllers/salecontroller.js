const saleService = require("../services/saleService");

const createSale = async (req, res) => {
  try {
    const sale = await saleService.createSale(req.body);

    res.status(201).json({
      message: "Sale created successfully",
      sale,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSale,
};
const getSales = async (req, res) => {
  try {
    const sales = await saleService.getSales();

    res.status(200).json({
      message: "Sales retrieved successfully",
      sales,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);

    res.status(200).json({
      message: "Sale retrieved successfully",
      sale,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
};