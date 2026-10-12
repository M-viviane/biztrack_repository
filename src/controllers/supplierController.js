const supplierService = require("../services/supplierService");

const createSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);

    return res.status(201).json({
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getSuppliers();

    return res.status(200).json({
      data: suppliers,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);

    return res.status(200).json({
      data: supplier,
    });
  } catch (error) {
    const status = error.message === "Supplier not found" ? 404 : 400;

    return res.status(status).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
};