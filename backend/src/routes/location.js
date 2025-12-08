const express = require("express");
const router = express.Router();
const {
  Outlet,
  Brand,
  BrandMenuItem,
  Category,
} = require("../models/associations");
const { authenticateToken } = require("../middleware/auth");
const { Op } = require("sequelize");

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// GET /api/location/nearby-outlets - Find outlets within delivery range
router.get("/nearby-outlets", async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    // Get all active outlets
    const outlets = await Outlet.findAll({
      where: {
        is_active: true,
        is_delivery_available: true,
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null },
      },
      include: [
        {
          model: Brand,
          as: "brand",
          where: { is_active: true },
          attributes: [
            "id",
            "name",
            "slug",
            "logo_url",
            "cuisine_type",
            "average_rating",
            "minimum_order_amount",
            "delivery_fee",
            "estimated_delivery_time",
          ],
        },
      ],
    });

    // Filter outlets within delivery range
    const nearbyOutlets = outlets
      .filter((outlet) => {
        const distance = calculateDistance(
          userLat,
          userLon,
          parseFloat(outlet.latitude),
          parseFloat(outlet.longitude)
        );

        // Check if outlet is within both user's search radius and outlet's delivery radius
        return distance <= Math.min(searchRadius, outlet.delivery_radius);
      })
      .map((outlet) => {
        const distance = calculateDistance(
          userLat,
          userLon,
          parseFloat(outlet.latitude),
          parseFloat(outlet.longitude)
        );

        return {
          ...outlet.toJSON(),
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          estimated_delivery_time:
            outlet.Brand.estimated_delivery_time + Math.ceil(distance * 2), // Add travel time
        };
      });

    // Sort by distance
    nearbyOutlets.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: {
        user_location: { latitude: userLat, longitude: userLon },
        outlets: nearbyOutlets,
        total_outlets: nearbyOutlets.length,
      },
    });
  } catch (error) {
    console.error("Error finding nearby outlets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to find nearby outlets",
      error: error.message,
    });
  }
});

// GET /api/location/available-brands - Get unique brands available in user's area
router.get("/available-brands", async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const searchRadius = parseFloat(radius);

    // Get all active outlets with their brands
    const outlets = await Outlet.findAll({
      where: {
        is_active: true,
        is_delivery_available: true,
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null },
      },
      include: [
        {
          model: Brand,
          as: "brand",
          where: { is_active: true },
          attributes: [
            "id",
            "name",
            "slug",
            "description",
            "logo_url",
            "banner_url",
            "cuisine_type",
            "average_rating",
            "total_reviews",
            "is_featured",
            "minimum_order_amount",
            "delivery_fee",
            "estimated_delivery_time",
          ],
        },
      ],
    });

    // Filter outlets within delivery range and group by brand
    const brandsMap = new Map();

    outlets.forEach((outlet) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        parseFloat(outlet.latitude),
        parseFloat(outlet.longitude)
      );

      if (distance <= Math.min(searchRadius, outlet.delivery_radius)) {
        const brand = outlet.Brand;
        const brandId = brand.id;

        if (!brandsMap.has(brandId)) {
          brandsMap.set(brandId, {
            ...brand.toJSON(),
            outlets: [],
            min_distance: distance,
            min_delivery_time:
              brand.estimated_delivery_time + Math.ceil(distance * 2),
          });
        }

        const brandData = brandsMap.get(brandId);
        brandData.outlets.push({
          id: outlet.id,
          name: outlet.name,
          address: outlet.address,
          distance: Math.round(distance * 100) / 100,
          estimated_delivery_time:
            brand.estimated_delivery_time + Math.ceil(distance * 2),
        });

        // Update minimum distance and delivery time
        if (distance < brandData.min_distance) {
          brandData.min_distance = Math.round(distance * 100) / 100;
          brandData.min_delivery_time =
            brand.estimated_delivery_time + Math.ceil(distance * 2);
        }
      }
    });

    // Convert to array and sort by minimum distance
    const availableBrands = Array.from(brandsMap.values()).sort(
      (a, b) => a.min_distance - b.min_distance
    );

    res.json({
      success: true,
      data: {
        user_location: { latitude: userLat, longitude: userLon },
        brands: availableBrands,
        total_brands: availableBrands.length,
      },
    });
  } catch (error) {
    console.error("Error finding available brands:", error);
    res.status(500).json({
      success: false,
      message: "Failed to find available brands",
      error: error.message,
    });
  }
});

// GET /api/location/brand-menu/:brandId - Get menu for a brand with nearest outlet info
router.get("/brand-menu/:brandId", async (req, res) => {
  try {
    const { brandId } = req.params;
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "User location (latitude and longitude) is required",
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    // Find the brand
    const brand = await Brand.findByPk(brandId, {
      where: { is_active: true },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Find nearest outlet for this brand
    const outlets = await Outlet.findAll({
      where: {
        brand_id: brandId,
        is_active: true,
        is_delivery_available: true,
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null },
      },
    });

    if (outlets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No outlets available for this brand in your area",
      });
    }

    // Find the nearest outlet within delivery range
    let nearestOutlet = null;
    let minDistance = Infinity;

    outlets.forEach((outlet) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        parseFloat(outlet.latitude),
        parseFloat(outlet.longitude)
      );

      if (distance <= outlet.delivery_radius && distance < minDistance) {
        minDistance = distance;
        nearestOutlet = {
          ...outlet.toJSON(),
          distance: Math.round(distance * 100) / 100,
          estimated_delivery_time:
            brand.estimated_delivery_time + Math.ceil(distance * 2),
        };
      }
    });

    if (!nearestOutlet) {
      return res.status(404).json({
        success: false,
        message: "No outlets available for delivery to your location",
      });
    }

    // Get menu items for this brand
    const menuItems = await BrandMenuItem.findAll({
      where: {
        brand_id: brandId,
        is_available: true,
      },
      include: [
        {
          model: Category,
          attributes: ["id", "name", "description", "image_url"],
        },
      ],
      order: [
        ["sort_order", "ASC"],
        ["name", "ASC"],
      ],
    });

    // Group menu items by category
    const categorizedMenu = {};
    menuItems.forEach((item) => {
      const categoryName = item.Category ? item.Category.name : "Others";
      if (!categorizedMenu[categoryName]) {
        categorizedMenu[categoryName] = {
          category: item.Category,
          items: [],
        };
      }
      categorizedMenu[categoryName].items.push(item);
    });

    res.json({
      success: true,
      data: {
        brand,
        nearest_outlet: nearestOutlet,
        menu: categorizedMenu,
        total_items: menuItems.length,
      },
    });
  } catch (error) {
    console.error("Error fetching brand menu:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand menu",
      error: error.message,
    });
  }
});

// POST /api/location/set-delivery-location - Save user's delivery location for session
router.post("/set-delivery-location", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, address, landmark, city, postal_code } =
      req.body;

    if (!latitude || !longitude || !address) {
      return res.status(400).json({
        success: false,
        message: "Latitude, longitude, and address are required",
      });
    }

    // In a real app, you might save this to user's profile or session
    // For now, we'll just validate and return success

    res.json({
      success: true,
      message: "Delivery location set successfully",
      data: {
        delivery_location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address,
          landmark,
          city,
          postal_code,
        },
      },
    });
  } catch (error) {
    console.error("Error setting delivery location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set delivery location",
      error: error.message,
    });
  }
});

// ============================================================================
// PHASE 3B: MULTI-BRAND LOCATION-BASED APIs (Cloud Kitchen Model)
// ============================================================================

const locationController = require('../controllers/locationController');

/**
 * @route GET /api/location/multi-brands
 * @desc Get all brands available near a specific location (multi-brand outlets)
 * @query latitude (required) - Customer's latitude
 * @query longitude (required) - Customer's longitude  
 * @query radius (optional) - Search radius in kilometers (default: 10)
 * @access Public
 */
router.get('/multi-brands', (req, res) => locationController.getBrandsNearLocation(req, res));

/**
 * @route GET /api/location/multi-brands/:brandId/menu
 * @desc Get menu for a specific brand with outlet-specific pricing
 * @param brandId - Brand ID to get menu for
 * @query latitude, longitude OR outlet_id - Either location or specific outlet
 * @access Public
 */
router.get('/multi-brands/:brandId/menu', (req, res) => locationController.getBrandMenuWithPricing(req, res));

/**
 * @route POST /api/location/assign-outlet
 * @desc Find and assign the best outlet to fulfill an order
 * @body brand_id, customer_latitude, customer_longitude, order_items (optional)
 * @access Public
 */
router.post('/assign-outlet', (req, res) => locationController.assignOutletForOrder(req, res));

module.exports = router;
