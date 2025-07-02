// src/index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");

// ✅ Import db
const { pool } = require("./config/db"); // <-- penting!

// Routes
const authRoutes = require("./routes/authRoutes");
const parameterRoutes = require("./routes/parameterRoutes");
const kuesionerRoutes = require("./routes/kuesionerRoutes");
const ruangRoutes = require("./routes/ruangRoutes");

const app = express();

// Middleware setup...

// ✅ Session middleware dengan PostgreSQL
const pgSession = require("connect-pg-simple")(session);

app.use(
  session({
    store: new pgSession({
      pool: pool, // ✅ Gunakan pool yang sudah di-import
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET || "rahasia_session",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
    },
  })
);

// Passport middleware
require("./auth/passport");
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parameter", parameterRoutes);
app.use("/api/kuesioner", kuesionerRoutes);
app.use("/api/ruang", ruangRoutes);

// ✅ Default route untuk health check Railway
app.get("/", (req, res) => {
  console.log("🎯 / accessed");
  res.status(200).json({
    status: "OK",
    message: "API Kuesioner is running...",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/env", (req, res) => {
  console.log("🎯 /env accessed");
  const { PORT, NODE_ENV, DATABASE_URL } = process.env;
  res.json({
    PORT,
    NODE_ENV,
    DATABASE_URL: !!DATABASE_URL,
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT NOW()");
    res.json(rows[0]);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = app;
