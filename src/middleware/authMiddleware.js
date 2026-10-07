const jwt = require("jsonwebtoken");

// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================

const authMiddleware = (req, res, next) => {
  try {

    // Get Authorization header
    const authHeader = req.headers.authorization;

    // No token
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided."
      });
    }

    // Check Bearer format
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid token format"
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Save decoded information
    req.user = decoded;

    console.log("Decoded JWT:", decoded);

    // Continue
    next();

  } catch (error) {
    console.log("JWT Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;