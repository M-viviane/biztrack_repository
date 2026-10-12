const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No Authorization header
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header is required."
      });
    }

    // Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format. Use Bearer token."
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("Decoded JWT:", decoded);

    // Store user information for other middleware
    req.user = decoded;

    next();

  } catch (error) {
    console.error("JWT Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired. Please login again."
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token."
      });
    }

    return res.status(401).json({
      message: "Authentication failed."
    });
  }
};

module.exports = authMiddleware;