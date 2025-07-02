// routes/parameterRoutes.js
const router = require("express").Router();
//const auth = require("../middleware/auth");
const ctrl = require("../controllers/parameterController");
//const { getAllRoles } = require("../services/roleService");

// Middleware untuk memastikan semua role bisa akses
// const allowAllRoles = async (req, res, next) => {
//   try {
//     const allowedRoles = await getAllRoles();
//     const authMiddleware = auth(allowedRoles); // izinkan semua role dari tabel
//     authMiddleware(req, res, next);
//   } catch (err) {
//     console.error("Failed to fetch roles:", err);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // Gunakan hanya middleware ini saja
// router.use(allowAllRoles);

// Pagination berdasarkan id_ruang
router.get("/ruang/:id", ctrl.listruang);

// Daftar semua parameter
router.get("/", ctrl.list);

// CRUD dasar
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
