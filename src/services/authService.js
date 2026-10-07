const bcrypt = require("bcrypt");

const prisma = require("../config/prisma");

const { generateToken } = require("../utils/jwt");

// ===============================
// REGISTER USER
// ===============================

const registerUser = async ({ name, email, password }) => {

  // Check if user already exists
  const existingUser = await prisma.users.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Find STAFF role
  const staffRole = await prisma.roles.findFirst({
    where: {
      name: "STAFF"
    }
  });

  // Make sure STAFF role exists
  if (!staffRole) {
    throw new Error("STAFF role not found");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with STAFF role
  const user = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role_id: staffRole.id
    },
    include: {
      roles: true
    }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};


// ===============================
// LOGIN USER
// ===============================

const loginUser = async ({ email, password }) => {

  // Find user by email and include role
  const user = await prisma.users.findUnique({
    where: {
      email
    },
    include: {
      roles: true
    }
  });

  // User not found
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if password exists
  if (!user.password) {
    throw new Error("Invalid email or password");
  }

  // Compare password
  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  // Wrong password
  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const token = generateToken(user);

  // Remove password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};


module.exports = {
  registerUser,
  loginUser
};