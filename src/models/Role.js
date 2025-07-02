const db = require("../config/db");

class Role {
  // Cari role berdasarkan name
  static async findByName(name) {
    const { rows } = await db.query("SELECT * FROM role WHERE name = $1", [
      name,
    ]);
    return rows[0] || null;
  }

  // Cari role berdasarkan id
  static async findById(id) {
    const { rows } = await db.query("SELECT * FROM role WHERE id = $1", [id]);
    return rows[0] || null;
  }

  // Buat role baru
  static async create({ name, deskripsi, butuh_sekolah }) {
    const { rows } = await db.query(
      `INSERT INTO role (name, deskripsi, butuh_sekolah) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, deskripsi, butuh_sekolah]
    );
    return rows[0];
  }

  // Update role
  static async update(id, { name, deskripsi, butuh_sekolah }) {
    const { rows } = await db.query(
      `UPDATE role SET 
        name = COALESCE($1, name),
        deskripsi = COALESCE($2, deskripsi),
        butuh_sekolah = COALESCE($3, butuh_sekolah)
       WHERE id = $4 RETURNING *`,
      [name, deskripsi, butuh_sekolah, id]
    );
    return rows[0];
  }

  // Hapus role
  static async delete(id) {
    const { rowCount } = await db.query("DELETE FROM role WHERE id = $1", [id]);
    return rowCount > 0;
  }
}

module.exports = Role;
