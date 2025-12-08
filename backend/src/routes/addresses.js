const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { authenticateToken } = require("../middleware/auth");

// All address routes require authentication
router.use(authenticateToken);

// GET /api/addresses - Get user's saved addresses
router.get("/", addressController.getAddresses);

// GET /api/addresses/default - Get user's default address
router.get("/default", addressController.getDefaultAddress);

// POST /api/addresses - Create new address
router.post("/", addressController.createAddress);

// POST /api/addresses/validate-coordinates - Validate coordinates
router.post("/validate-coordinates", addressController.validateCoordinates);

// GET /api/addresses/:id - Get specific address
router.get("/:id", addressController.getAddress);

// PUT /api/addresses/:id - Update address
router.put("/:id", addressController.updateAddress);

// DELETE /api/addresses/:id - Delete address
router.delete("/:id", addressController.deleteAddress);

// PATCH /api/addresses/:id/default - Set as default address
router.patch("/:id/default", addressController.setDefaultAddress);

module.exports = router;
