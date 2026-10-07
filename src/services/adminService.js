const prisma = require("../config/prisma");

// ===============================
// GET ALL USERS
// ===============================

const getAllUsers = async () => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role_id: true,
      created_at: true,
      updated_at: true,

      roles: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });

  return users;
};

module.exports = {
  getAllUsers
};