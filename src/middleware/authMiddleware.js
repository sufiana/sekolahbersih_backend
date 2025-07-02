const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Middleware untuk verifikasi JWT
const authMiddleware = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      // Ambil token dari header
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
      }

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Cek apakah user ada di database
      const { rows: users } = await db.query(
        "SELECT u.*, r.name as role_name, r.butuh_sekolah FROM users u JOIN role r ON u.role = r.id WHERE u.id = $1",
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: "User tidak ditemukan" });
      }

      const user = users[0];

      // Cek role jika diperlukan
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role_name)) {
        return res.status(403).json({ message: "Akses ditolak" });
      }

      // Cek butuh_sekolah jika role membutuhkan
      if (user.butuh_sekolah && user.id_sekolah === 0) {
        return res.status(403).json({
          message: "User ini membutuhkan asosiasi dengan sekolah",
        });
      }

      // Tambahkan user ke request
      req.user = user;

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token telah kadaluarsa" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Token tidak valid" });
      }
      console.error("Auth middleware error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = authMiddleware;
