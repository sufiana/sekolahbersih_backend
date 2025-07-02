// src/index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");

// Import routes
const authRoutes = require("./routes/authRoutes");
const parameterRoutes = require("./routes/parameterRoutes");
const kuesionerRoutes = require("./routes/kuesionerRoutes");
const ruangRoutes = require("./routes/ruangRoutes");

// Inisiasi app
const app = express();

// ✅ Middleware harus diurutan benar

// CORS middleware - paling atas
app.use(
  cors({
    origin: process.env.FRONTEND_URL_DEV || "http://localhost:3001",
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware - gunakan connect-pg-simple jika production
app.use(
  session({
    secret: process.env.SESSION_SECRET || "google_sso_session_secret",
    resave: false,
    saveUninitialized: false,
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
  res.status(200).json({
    status: "OK",
    message: "API Kuesioner is running...",
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ Test DB endpoint
app.get("/test-db", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT NOW()");
    res.json(rows[0]);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ Optional: test env variables
app.get("/env", (req, res) => {
  const { PORT, NODE_ENV, DATABASE_URL } = process.env;
  res.json({
    PORT,
    NODE_ENV,
    DATABASE_URL: !!DATABASE_URL,
  });
});

// Export app
module.exports = app;
