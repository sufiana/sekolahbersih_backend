require("dotenv").config();
const { Pool } = require("pg");

// Create the connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Additional connection options
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection on startup
pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    // Optionally: process.exit(1) if you want the app to fail fast
  });

// Export for direct query usage
module.exports = {
  query: (text, params) => pool.query(text, params),
  // Export the pool directly if needed for transactions
  pool,
};
