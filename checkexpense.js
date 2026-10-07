const prisma = require("./src/config/prisma");

async function checkExpense() {
  try {
    const expense = await prisma.expense.create({
      data: {
        title: "Test Expense",
        category: "RENT",
        amount: 1000,
      },
    });

    console.log("Expense created successfully:");
    console.log(expense);
  } catch (error) {
    console.log("ERROR:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkExpense();