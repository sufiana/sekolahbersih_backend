// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Check authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authorization token required",
        });
      }

      // Extract token
      const token = authHeader.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user with role info
      const userQuery = await db.query(
        `SELECT 
          u.id, u.username, u.email, u.role, u.id_sekolah, u.is_active,
          r.name AS role_name, r.deskripsi
         FROM users u
         JOIN role r ON u.role = r.id
         WHERE u.id = $1`,
        [decoded.id]
      );

      // Check if user exists and is active
      if (!userQuery.rows.length || !userQuery.rows[0].is_active) {
        return res.status(401).json({
          success: false,
          message: "User not found or inactive",
        });
      }

      const user = userQuery.rows[0];

      // Check role permissions
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name,
        role_description: user.role_description,
        id_sekolah: user.id_sekolah,
      };

      next();
    } catch (err) {
      console.error("Authentication error:", err);

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
          error_code: "TOKEN_EXPIRED",
        });
      }

      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
          error_code: "TOKEN_INVALID",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};
