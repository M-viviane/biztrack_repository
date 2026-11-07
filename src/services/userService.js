const prisma = require("../config/prisma");

// ======================================
// GET ALL USERS
// ======================================
const getAllUsers = async () => {
  return await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role_id: true,
      created_at: true,

      roles: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
};

// ======================================
// GET USER BY ID
// ======================================

// GET USER BY ID
const getUserById = async (id) => {
  const userId = Number(id);

  if (!id || !Number.isInteger(userId) || userId <= 0) {
    throw new Error("Valid user ID is required");
  }

  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role_id: true,
      created_at: true,
      roles: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return user;
};

// ======================================
// EXPORT FUNCTIONS
// ======================================
module.exports = {
  getAllUsers,
  getUserById,
};
