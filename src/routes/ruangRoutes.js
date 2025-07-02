// routes/parameterRoutes.js
const router = require("express").Router();
const ctrl = require("../controllers/ruangSekolahController");

router.get("/", ctrl.list);

module.exports = router;
