const express = require("express");
const router = express.Router();
const outletController = require("../controllers/outletController");

// GET /api/outlets/nearest - Find single nearest outlet
router.get("/nearest", outletController.findNearestOutlet);

// GET /api/outlets/nearby - Find nearby outlets
router.get("/nearby", outletController.findNearbyOutlets);

// GET /api/outlets/:id/brands - Get all brands available at specific outlet
router.get("/:id/brands", outletController.getOutletBrands);

// GET /api/outlets/:id - Get outlet details by ID
router.get("/:id", outletController.getOutletById);

// GET /api/outlets/:id/delivery-check - Check if outlet delivers to location
router.get("/:id/delivery-check", outletController.checkDeliveryAvailability);

module.exports = router;
