// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const Role = require("../models/Role");
const router = express.Router();
require("dotenv").config();

// Helper untuk generate token
const generateToken = (user, roleName, sekolahName) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: roleName,
      sekolah: sekolahName || "0",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Endpoint untuk login email/password
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Validasi input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email dan password wajib diisi",
    });
  }

  try {
    // 2. Cari user beserta info role
    const {
      rows: [user],
    } = await db.query(
      `SELECT 
        u.*, 
        r.name as role_name, 
        r.butuh_sekolah,
        s.nama as sekolah_nama
       FROM users u
       JOIN role r ON u.role = r.id
       LEFT JOIN sekolah s ON u.id_sekolah = s.id
       WHERE u.email = $1`,
      [email]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email tidak terdaftar",
      });
    }

    // 3. Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    // 4. Payload JWT
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role_name,
      sekolah: user.butuh_sekolah ? user.sekolah_nama || "0" : "0",
      id_sekolah: user.id_sekolah,
    };

    // 5. Generate JWT Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // 6. Set Cookie Token (HttpOnly)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // hanya HTTPS di production
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000, // 2 jam
      path: "/",
    });

    // 7. Update last login
    await db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);

    // 8. Kirim response tanpa token
    const { password_hash, refresh_token, ...safeUser } = user;

    res.json({
      success: true,
      message: "Login berhasil",
      token: token,

      user: {
        ...safeUser,
        role: user.role_name,
        sekolah: payload.sekolah,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Endpoint untuk Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/failure",
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      // Cek apakah user aktif dan memiliki role
      if (!user.is_active || user.role === 0) {
        const msg = encodeURIComponent(
          "Mohon maaf, email Anda tidak terdaftar atau belum memiliki otorisasi untuk masuk ke sistem. Silakan hubungi staf administrator Dinas Pendidikan untuk aktivasi akun Anda."
        );
        return res.redirect(`/api/auth/failure?reason=unauthorized&msg=${msg}`);
      }

      // Ambil data role dari DB
      const role = await Role.findById(user.role);
      if (!role) {
        return res.redirect("/api/auth/failure?reason=role_not_found");
      }

      // Siapkan payload token
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: role.name,
        sekolah: user.id_sekolah || 0,
      };

      // Buat token JWT
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60 * 1000,
        path: "/",
      });

      // Tentukan URL frontend
      const frontendURL =
        process.env.FRONTEND_URL ||
        process.env.FRONTEND_URL_DEV ||
        "http://localhost:3000";

      // Redirect ke dashboard frontend
      res.redirect(`${frontendURL}/dashboard`);
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect("/api/auth/failure?reason=server_error");
    }
  }
);

router.get("/auth/failure", (req, res) => {
  const reason = req.query.reason || "unknown";
  const msg =
    req.query.msg ||
    "Autentikasi gagal. Silakan coba lagi atau hubungi administrator.";

  res.status(401).send(`
    <h2>Autentikasi Gagal</h2>
    <p><strong>Alasan:</strong> ${reason}</p>
    <p>${msg}</p>
  `);
});

// Endpoint untuk mendapatkan semua role
router.get("/roles", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM role ORDER BY id");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "DB Error" });
  }
});

// Endpoint untuk update user role
router.put("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const roleExists = await db.query("SELECT 1 FROM role WHERE name = $1", [
      role,
    ]);

    if (!roleExists.rows.length) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    const updatedUser = await db.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
      [role, id]
    );

    res.json({
      message: "Role berhasil diupdate",
      user: updatedUser.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengupdate role" });
  }
});

// Endpoint untuk mendapatkan user profile
router.get("/profile", async (req, res) => {
  try {
    let token;

    // Cek dari header atau cookie
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows: users } = await db.query(
      "SELECT u.*, r.name as role_name, r.butuh_sekolah FROM users u JOIN role r ON u.role = r.id WHERE u.id = $1",
      [decoded.id]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = users[0];

    let sekolahName = "0";
    if (user.butuh_sekolah && user.id_sekolah > 0) {
      const { rows: sekolahRows } = await db.query(
        "SELECT nama FROM sekolah WHERE id = $1",
        [user.id_sekolah]
      );
      sekolahName = sekolahRows[0]?.nama || "0";
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name,
        sekolah: sekolahName,
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token tidak valid" });
    }
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint untuk logout
router.post("/logout", async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("token");

    // Verifikasi token jika ada untuk ambil ID user
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await db.query(
        "UPDATE users SET refresh_token = NULL, refresh_token_expires = NULL WHERE id = $1",
        [decoded.id]
      );
    }

    res.json({ success: true, message: "Logout berhasil" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
