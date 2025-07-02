require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // sesuaikan untuk prod
  },
});

// Test the connection on startup
// pool
//   .query("SELECT NOW()")
//   .then(() => console.log("✅ Database connected successfully"))
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err.message);
//   });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
