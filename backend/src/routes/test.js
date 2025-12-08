// Test endpoint
const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  console.log("🔥 Test endpoint hit!");
  res.json({
    success: true,
    message: "Backend is reachable from frontend!",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
