const router = require("express").Router();
const ctrl = require("../controllers/kuesionerController");
//const auth = require("../middleware/auth");

// Gunakan auth tanpa pembatasan role untuk semua route di bawah ini
//router.use(auth([])); // ← [] artinya tidak ada validasi role, hanya autentikasi

// Route dasar: /api/kuesioner
router.get("/", ctrl.list); // GET /api/kuesioner
router.post("/", ctrl.create); // POST /api/kuesioner
router.put("/:id", ctrl.update); // PUT /api/kuesioner/:id
router.delete("/:id", ctrl.remove); // DELETE /api/kuesioner/:id

// Khusus route submit dan hasil kuesioner
router.post("/submit", ctrl.submitHasilKuesioner); // POST /api/kuesioner/submit
router.get("/result/:id", ctrl.getResultKuesioner); // GET /api/kuesioner/result/:id

module.exports = router;
