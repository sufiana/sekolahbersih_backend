const db = require('../config/db');

exports.getAll = async () => {
  const res = await db.query('SELECT * FROM ruang_sekolah');
  return res.rows;
};