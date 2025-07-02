// src/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware(), (req, res) => {
  res.json({
    message: "Dashboard data",
    user: req.user, // Info user dari JWT
  });
});

module.exports = router;
