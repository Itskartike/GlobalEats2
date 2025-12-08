// Add this route to your backend routes
// File: backend/src/routes/outlets.js

const express = require("express");
const router = express.Router();
const { Outlet, Brand } = require("../models");

// POST /api/outlets/:outletId/brands
// Add multiple brands to an outlet
router.post("/:outletId/brands", async (req, res) => {
  try {
    const { outletId } = req.params;
    const { brandIds } = req.body; // Array of brand IDs

    // Validate outlet exists
    const outlet = await Outlet.findByPk(outletId);
    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: "Outlet not found",
      });
    }

    // Validate all brands exist
    const brands = await Brand.findAll({
      where: {
        id: brandIds,
      },
    });

    if (brands.length !== brandIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more brands not found",
      });
    }

    // Add brands to outlet (this assumes you have the association set up)
    await outlet.addBrands(brands);

    res.json({
      success: true,
      message: `Added ${brands.length} brands to outlet`,
      data: {
        outlet: {
          id: outlet.id,
          name: outlet.name,
        },
        brands: brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
        })),
      },
    });
  } catch (error) {
    console.error("Error adding brands to outlet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add brands to outlet",
      error: error.message,
    });
  }
});

// GET /api/outlets/:outletId/brands
// This endpoint already exists in your codebase

// DELETE /api/outlets/:outletId/brands/:brandId
// Remove a brand from an outlet
router.delete("/:outletId/brands/:brandId", async (req, res) => {
  try {
    const { outletId, brandId } = req.params;

    // Find and remove the association
    const result = await sequelize.query(
      "DELETE FROM outlet_brands WHERE outlet_id = ? AND brand_id = ?",
      {
        replacements: [outletId, brandId],
        type: QueryTypes.DELETE,
      }
    );

    res.json({
      success: true,
      message: "Brand removed from outlet successfully",
    });
  } catch (error) {
    console.error("Error removing brand from outlet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove brand from outlet",
    });
  }
});

module.exports = router;
