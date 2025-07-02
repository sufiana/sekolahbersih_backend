const app = require("./src/index");
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0"; // ← tambahkan ini

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
