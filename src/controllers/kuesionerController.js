const db = require("../config/db");
const { insertHasilKuesioner } = require("../models/Kuesioner");
const { getKuesionerResult } = require("../models/Kuesioner");

const list = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM hasil_kuesioner LIMIT 10");
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listruang = async (req, res) => {
  const idRuang = req.params.id;
  try {
    const result = await db.query(
      "SELECT * FROM parameter_kebersihan WHERE id_ruang = $1",
      [idRuang]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error("❌ Error fetching parameter by ruang:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const create = async (req, res) => {
  res.json({ msg: "Create handler (not implemented)" });
};

const update = async (req, res) => {
  res.json({ msg: "Update handler (not implemented)" });
};

const remove = async (req, res) => {
  res.json({ msg: "Delete handler (not implemented)" });
};

const submitHasilKuesioner = async (req, res) => {
  try {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "Data harus berupa array." });
    }

    await insertHasilKuesioner(data);
    return res
      .status(200)
      .json({ message: "Data berhasil disimpan.", total: data.length });
  } catch (error) {
    console.error("❌ Gagal insert ke DB:", error);
    return res.status(500).json({ error: "Gagal menyimpan data." });
  }
};

const getResultKuesioner = async (req, res) => {
  try {
    const tahunAjaran = process.env.TAHUN_AJARAN || "2025-2026";
    const id_sekolah = 101; // asumsikan di middleware JWT decode
    const id_ruang = 11;

    const data = await getKuesionerResult({
      tahunAjaran,
      idSekolah: id_sekolah,
      idRuang: id_ruang,
    });

    res.json({ data });
  } catch (err) {
    console.error("❌ Gagal ambil hasil kuesioner:", err.message);
    res.status(500).json({ message: "Gagal mengambil data hasil kuesioner." });
  }
};

module.exports = {
  list,
  listruang,
  create,
  update,
  remove,
  submitHasilKuesioner,
  getResultKuesioner,
};
