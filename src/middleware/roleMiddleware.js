const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {

    // ===============================
    // CHECK AUTHENTICATION
    // ===============================

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // ===============================
    // DEBUG INFORMATION
    // ===============================

    console.log("User role:", req.user.role);
    console.log("Allowed roles:", allowedRoles);

    // ===============================
    // CHECK IF USER HAS A ROLE
    // ===============================

    if (!req.user.role) {
      return res.status(403).json({
        message: "Access denied. No role assigned."
      });
    }

    // ===============================
    // CASE-INSENSITIVE ROLE CHECK
    // ===============================

    const userRole = req.user.role.toLowerCase();

    const roles = allowedRoles.map((role) =>
      role.toLowerCase()
    );

    // ===============================
    // CHECK PERMISSION
    // ===============================

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission."
      });
    }

    // ===============================
    // ROLE IS ALLOWED
    // ===============================

    next();
  };
};

module.exports = roleMiddleware;