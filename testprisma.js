const prisma = require("./src/config/prisma");

console.log("inventory:", typeof prisma.inventory);
console.log("inventoryMovement:", typeof prisma.inventoryMovement);
console.log("product:", typeof prisma.product);

process.exit();
