const db = require("../config/db");

const getAll = async () => {
  const res = await db.query("SELECT * FROM hasil_kuesioner");
  return res.rows;
};

const create = async (data) => {
  const {
    id_sekolah,
    id_user,
    id_parameter,
    id_ruang,
    jawaban,
    deskripsi_jawaban,
    tahun_ajaran,
    periode,
    user_created,
  } = data;

  const result = await db.query(
    `INSERT INTO hasil_kuesioner (
      id_sekolah, id_user, id_parameter, id_ruang,
      jawaban, deskripsi_jawaban, tahun_ajaran, periode,
      time_created, user_created
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9) RETURNING *`,
    [
      id_sekolah,
      id_user,
      id_parameter,
      id_ruang,
      jawaban,
      deskripsi_jawaban,
      tahun_ajaran,
      periode,
      user_created,
    ]
  );

  return result.rows[0];
};

const update = async (id, data) => {
  const { jawaban, deskripsi_jawaban, user_updated } = data;

  const result = await db.query(
    `UPDATE hasil_kuesioner SET
     jawaban=$1, deskripsi_jawaban=$2,
     time_update=NOW(), user_updated=$3
     WHERE id=$4 RETURNING *`,
    [jawaban, deskripsi_jawaban, user_updated, id]
  );

  return result.rows[0];
};

const remove = async (id) => {
  await db.query(`DELETE FROM hasil_kuesioner WHERE id=$1`, [id]);
};

const insertHasilKuesioner = async (dataArray, batchSize = 10) => {
  console.time("⏱️ Start insert");

  for (let i = 0; i < dataArray.length; i += batchSize) {
    const batch = dataArray.slice(i, i + batchSize);
    const values = batch.flatMap((item) => [
      item.id_sekolah,
      item.id_user,
      item.id_parameter,
      item.id_ruang,
      item.jawaban,
      item.deskripsi_jawaban,
      item.tahun_ajaran,
    ]);

    const placeholders = batch
      .map(
        (_, idx) =>
          `($${idx * 7 + 1}, $${idx * 7 + 2}, $${idx * 7 + 3}, $${
            idx * 7 + 4
          }, $${idx * 7 + 5}, $${idx * 7 + 6}, $${idx * 7 + 7})`
      )
      .join(",");

    const query = `
      INSERT INTO hasil_kuesioner (
        id_sekolah, id_user, id_parameter, id_ruang,
        jawaban, deskripsi_jawaban, tahun_ajaran
      ) VALUES ${placeholders}
    `;

    await db.query(query, values);
  }

  console.timeEnd("⏱️ Start insert");
};

const getKuesionerResult = async ({ tahunAjaran, idSekolah, idRuang }) => {
  const query = `
    SELECT hk.*, s.nama AS nama_sekolah, rs.nama AS nama_ruang, pk.parameter
    FROM hasil_kuesioner hk
    JOIN parameter_kebersihan pk ON hk.id_parameter = pk.id
    JOIN ruang_sekolah rs ON hk.id_ruang = rs.id
    JOIN sekolah s ON hk.id_sekolah = s.id
    WHERE hk.tahun_ajaran = $1 AND hk.id_sekolah = $2 AND hk.id_ruang = $3
    ORDER BY hk.id ASC
  `;

  const values = [tahunAjaran, idSekolah, idRuang];
  const res = await db.query(query, values);
  return res.rows;
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  insertHasilKuesioner,
  getKuesionerResult,
};
