const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please login first."
      });
    }

    // Get user's role
    const userRole = req.user.role;

    console.log("========== ROLE CHECK ==========");
    console.log("User role:", userRole);
    console.log("Allowed roles:", allowedRoles);

    // Check if user's role is allowed
    if (!allowedRoles.includes(userRole)) {
      console.log("ACCESS DENIED");

      return res.status(403).json({
        message: "Access denied. You do not have permission."
      });
    }

    console.log("ACCESS GRANTED");

    next();
  };
};

module.exports = roleMiddleware;