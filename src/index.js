// src/index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const parameterRoutes = require("./routes/parameterRoutes");
const kuesionerRoutes = require("./routes/kuesionerRoutes");
const ruangRoutes = require("./routes/ruangRoutes");
// const printRoutes = require("./routes/printRoutes");

const app = express();

// ✅ CORS harus di paling atas dan lengkap
app.use(
  cors({
    origin: process.env.FRONTEND_URL_DEV || "http://localhost:3001",
    credentials: true,
  })
);

// ✅ Cookie parser di awal
app.use(cookieParser());

// ✅ Body parser setelah cookieParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "google_sso_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Passport
require("./auth/passport");
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/parameter", parameterRoutes);
app.use("/api/kuesioner", kuesionerRoutes);
app.use("/api/ruang", ruangRoutes);
// app.use("/api/print", printRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("API Kuesioner is running...");
});

app.get("/test-db", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT NOW()");
    res.send(rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/env", (req, res) => {
  const { PORT, NODE_ENV, DATABASE_URL } = process.env;
  res.json({
    PORT,
    NODE_ENV,
    DATABASE_URL: !!DATABASE_URL,
  });
});

// 🚫 JANGAN JALANKAN SERVER DI SINI
// app.listen(...) dipindahkan ke server.js
module.exports = app;
