const authService = require("../services/authService");

// ===============================
// REGISTER
// ===============================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    // Register user
    const user = await authService.registerUser({
      name,
      email,
      password
    });

    res.status(201).json({
      message: "User registered successfully",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

// ===============================
// LOGIN
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Login user
    const result = await authService.loginUser({
      email,
      password
    });

    res.status(200).json({
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(401).json({
      message: error.message
    });
  }
};

module.exports = {
  register,
  login
};