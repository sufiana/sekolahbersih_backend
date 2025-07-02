require("dotenv").config();
const { Pool } = require("pg");

// Gunakan DATABASE_URL saja
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // penting jika pakai Railway/Render
  },
});

// Test the connection on startup
pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

// Export for direct query usage
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
