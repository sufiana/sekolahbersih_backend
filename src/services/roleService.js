const db = require("../config/db");

const getAllRoles = async () => {
  const result = await db.query("SELECT name FROM role");
  return result.rows.map((r) => r.name);
};

module.exports = { getAllRoles };
