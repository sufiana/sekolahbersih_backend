const RuangModel = require("../models/RuangSekolah");

exports.list = async (req, res) => {
  try {
    const ruangList = await RuangModel.getAll();
    res.json({
      success: true,
      data: ruangList,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
