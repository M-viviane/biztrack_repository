
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
const getUserById = async (id) => {
  return await prisma.users.findUnique({
    where: {
      id: Number(id),
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
};

// ======================================
// EXPORT FUNCTIONS
// ======================================
module.exports = {
  getAllUsers,
  getUserById,
};

