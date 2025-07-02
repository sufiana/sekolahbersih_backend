const app = require("./src/index");
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0"; // ← tambahkan ini

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 Global Error:", err.stack);
  res.status(500).json({ status: "error", message: "Internal Server Error" });
});

// Unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Optional: process.exit(1)
});
