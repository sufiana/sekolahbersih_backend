const ParameterModel = require("../models/ParameterKebersihan");

exports.list = async (req, res) => {
  try {
    // Implement if needed
    res.json({ msg: "Daftar semua parameter kebersihan" });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.listruang = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid room ID" });
    }

    const { rows: data } = await ParameterModel.getAllByRuangId(id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Error in listruang:", err);
    res.status(500).json({
      error: "Failed to fetch parameters",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Add these implementations when ready
exports.create = async (req, res) => {
  res.json({ msg: "Create handler" });
};

exports.update = async (req, res) => {
  res.json({ msg: "Update handler" });
};

exports.remove = async (req, res) => {
  res.json({ msg: "Delete handler" });
};
