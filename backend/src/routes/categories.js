const express = require("express");
const router = express.Router();
const { Category } = require("../models/associations");

// GET /api/categories - list all categories (optionally only active)
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;
    const where = {};
    if (active === "true") {
      where.is_active = true;
    }

    const categories = await Category.findAll({
      where,
      order: [["sort_order", "ASC"], ["name", "ASC"]],
      attributes: ["id", "name", "description", "image_url", "is_active", "sort_order"],
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories", error: error?.message });
  }
});

module.exports = router;


