const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
} = require("../controllers/supplierController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/",
  authMiddleware,
  roleMiddleware("ADMIN","MANAGER"),
  createSupplier);
router.get("/", 
  authMiddleware,
  roleMiddleware("ADMIN","MANAGER","STAFF"),
  getSuppliers);
router.get("/:id",
  authMiddleware,
  roleMiddleware("ADMIN","MANAGER","STAFF"),
  getSupplierById);

module.exports = router;
authMiddleware,
roleMiddleware("ADMIN","MANAGER","STAFF")
