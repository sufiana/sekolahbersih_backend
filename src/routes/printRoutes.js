const express = require("express");
const router = express.Router();
const { generateKuesionerPDF } = require("../controllers/printController");

router.get("/hasil_kuesioner/:id_ruang", generateKuesionerPDF);

module.exports = router;
