const jwt = require("jsonwebtoken");

const payload = {
  user_id: 1,
  id_sekolah: 101,
  role: "sekolah",
};

const token = jwt.sign(
  payload,
  "b19590657dada1dcbe0cfb2ba8999f5942e476473833207840eb25c0e9251ba9",
  {
    expiresIn: "1h",
  }
);

console.log("JWT Token:\n", token);
