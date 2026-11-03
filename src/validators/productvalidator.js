
const { z } = require("zod");

const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must not exceed 100 characters"),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(50, "SKU must not exceed 50 characters"),

  cost_price: z.coerce
    .number()
    .finite()
    .min(0, "Cost price cannot be negative"),

  selling_price: z.coerce
    .number()
    .finite()
    .min(0, "Selling price cannot be negative"),

  category_id: z.coerce
    .number()
    .int("Category ID must be an integer")
    .positive("Category ID must be greater than 0"),

  unit: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema,
};
