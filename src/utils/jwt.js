const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      role: user.roles ? user.roles.name : null
    },
    env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};

module.exports = {
  generateToken
};