// Fills a new database with the data the app needs to work.
// Run: npm run db:seed   (Prisma runs this file; see prisma.config.ts)
//
// Safe to run many times: it only creates what is missing.
// It creates NO users, so no password is ever stored in the code.

// The roles the app checks in roleMiddleware. Registration gives every new
// user STAFF, so without these rows sign-up fails with "STAFF role not found".
const ROLES = [
  { name: "ADMIN", description: "Full access, including users and settings" },
  { name: "MANAGER", description: "Runs the shop: stock, purchases, reports" },
  { name: "STAFF", description: "Day-to-day work: sales and stock lookups" },
];

const seedRoles = async (prisma, log = console.log) => {
  for (const role of ROLES) {
    const existing = await prisma.roles.findFirst({
      where: { name: role.name },
    });

    if (existing) {
      log(`Role ${role.name} already exists`);
      continue;
    }

    await prisma.roles.create({
      data: { ...role, created_at: new Date() },
    });
    log(`Created role ${role.name}`);
  }
};

// Only touch the real database when this file is run directly,
// not when a test loads it.
if (require.main === module) {
  const prisma = require("../src/config/prisma");

  seedRoles(prisma)
    .catch((error) => {
      console.error("Seeding failed:", error.message);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { ROLES, seedRoles };
