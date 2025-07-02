// config/db.js

require("dotenv").config();
const { Pool } = require("pg");

// Gunakan DATABASE_URL saja
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // sesuaikan untuk prod
  },
});

// Export for direct query usage
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
