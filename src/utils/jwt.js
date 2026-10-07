const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      role: user.roles ? user.roles.name : null
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};

module.exports = {
  generateToken
};