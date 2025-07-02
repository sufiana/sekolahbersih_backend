const db = require("../config/db");

const ParameterModel = {
  /**
   * Get all cleanliness parameters for a room
   * @param {number} idRuang - Room ID
   * @returns {Promise<{rows: Array<object>}>}
   */
  getAllByRuangId: async (idRuang) => {
    const query = `
      SELECT 
        pk.*, 
        rs.nama as nama_ruang
      FROM parameter_kebersihan pk
      LEFT JOIN ruang_sekolah rs ON rs.id = pk.id_ruang
      WHERE pk.id_ruang = $1
      ORDER BY pk.id_ruang ASC, pk.id ASC`;

    const result = await db.query(query, [idRuang]);
    return result;
  },

  /**
   * Get parameters with pagination
   * @param {number} idRuang - Room ID
   * @param {number} limit - Items per page
   * @param {number} offset - Offset for pagination
   * @returns {Promise<{rows: Array<object>, total: number}>}
   */
  getAllByRuangIdWithPagination: async (idRuang, limit, offset) => {
    const query = `
      SELECT 
        pk.*, 
        rs.nama as nama_ruang
      FROM parameter_kebersihan pk
      LEFT JOIN ruang_sekolah rs ON rs.id = pk.id_ruang
      WHERE pk.id_ruang = $1
      ORDER BY pk.id_ruang ASC, pk.id ASC
      LIMIT $2 OFFSET $3`;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM parameter_kebersihan 
      WHERE id_ruang = $1`;

    const [dataResult, countResult] = await Promise.all([
      db.query(query, [idRuang, limit, offset]),
      db.query(countQuery, [idRuang]),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  },
};

module.exports = ParameterModel;
