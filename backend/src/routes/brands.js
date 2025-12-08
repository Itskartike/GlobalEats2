const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
// const auth = require("../middleware/auth"); // Temporarily disabled

// Public routes
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandDetails);
router.get("/:brandId/menu", brandController.getBrandMenu);
router.get("/:brandId/outlets/nearby", brandController.getNearbyOutlets);
router.get("/outlets/:outletId/menu", brandController.getOutletMenu);

// Protected routes (require authentication)
// Add any admin routes here later if needed

module.exports = router;
