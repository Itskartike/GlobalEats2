const { Outlet, Brand, OutletBrand } = require("../models/associations");
const { Op } = require("sequelize");

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

class OutletController {
  // Find nearby outlets within specified radius
  async findNearbyOutlets(req, res) {
    try {
      const { latitude, longitude, radius = 5 } = req.query;

      // Validate required parameters
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      const searchRadius = parseFloat(radius);

      // Find all active outlets with coordinates
      const outlets = await Outlet.findAll({
        where: {
          is_active: true,
          latitude: { [Op.not]: null },
          longitude: { [Op.not]: null },
        },
        include: [
          {
            model: Brand,
            as: "Brands",
            through: {
              model: OutletBrand,
              where: { is_available: true },
              attributes: [
                "is_available",
                "preparation_time",
                "minimum_order_amount",
                "delivery_fee",
              ],
            },
            where: { is_active: true },
            attributes: [
              "id",
              "name",
              "logo_url",
              "cuisine_type",
              "average_rating",
            ],
          },
        ],
        attributes: [
          "id",
          "name",
          "address",
          "city",
          "state",
          "latitude",
          "longitude",
          "phone",
          "is_delivery_available",
          "is_pickup_available",
          "delivery_radius",
          "operating_hours",
        ],
      });

      // Filter outlets within the specified radius and calculate distances
      const nearbyOutlets = outlets
        .map((outlet) => {
          const distance = calculateDistance(
            userLat,
            userLng,
            parseFloat(outlet.latitude),
            parseFloat(outlet.longitude)
          );

          return {
            ...outlet.toJSON(),
            distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          };
        })
        .filter((outlet) => outlet.distance <= searchRadius)
        .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

      res.json({
        success: true,
        data: {
          outlets: nearbyOutlets,
          totalCount: nearbyOutlets.length,
          searchRadius: searchRadius,
          userLocation: { latitude: userLat, longitude: userLng },
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
  }

  // Get outlet details by ID
  async getOutletById(req, res) {
    try {
      const { id } = req.params;

      const outlet = await Outlet.findOne({
        where: { id, is_active: true },
        include: [
          {
            model: Brand,
            as: "Brands",
            through: {
              model: OutletBrand,
              where: { is_available: true },
              attributes: [
                "is_available",
                "preparation_time",
                "minimum_order_amount",
                "delivery_fee",
              ],
            },
            where: { is_active: true },
            attributes: [
              "id",
              "name",
              "logo_url",
              "cuisine_types",
              "average_rating",
              "description",
            ],
          },
        ],
      });

      if (!outlet) {
        return res.status(404).json({
          success: false,
          message: "Outlet not found",
        });
      }

      res.json({
        success: true,
        data: outlet,
      });
    } catch (error) {
      console.error("Error fetching outlet details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch outlet details",
        error: error.message,
      });
    }
  }

  // Check if outlet delivers to a specific location
  async checkDeliveryAvailability(req, res) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const outlet = await Outlet.findOne({
        where: { id, is_active: true, is_delivery_available: true },
        attributes: ["id", "name", "latitude", "longitude", "delivery_radius"],
      });

      if (!outlet) {
        return res.status(404).json({
          success: false,
          message: "Outlet not found or delivery not available",
        });
      }

      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(outlet.latitude),
        parseFloat(outlet.longitude)
      );

      const isDeliveryAvailable =
        distance <= parseFloat(outlet.delivery_radius);

      res.json({
        success: true,
        data: {
          outletId: outlet.id,
          outletName: outlet.name,
          distance: Math.round(distance * 100) / 100,
          deliveryRadius: outlet.delivery_radius,
          isDeliveryAvailable,
        },
      });
    } catch (error) {
      console.error("Error checking delivery availability:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check delivery availability",
        error: error.message,
      });
    }
  }

  // Find single nearest outlet
  async findNearestOutlet(req, res) {
    try {
      const { latitude, longitude } = req.query;

      // Validate required parameters
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      // Find all active outlets with coordinates
      const outlets = await Outlet.findAll({
        where: {
          is_active: true,
          latitude: { [Op.not]: null },
          longitude: { [Op.not]: null },
        },
        include: [
          {
            model: Brand,
            as: "Brands",
            through: {
              model: OutletBrand,
              where: { is_available: true },
              attributes: [
                "is_available",
                "preparation_time",
                "minimum_order_amount",
                "delivery_fee",
              ],
            },
            where: { is_active: true },
            attributes: [
              "id",
              "name",
              "logo_url",
              "cuisine_type",
              "average_rating",
            ],
          },
        ],
        attributes: [
          "id",
          "name",
          "address",
          "city",
          "state",
          "latitude",
          "longitude",
          "phone",
          "is_delivery_available",
          "is_pickup_available",
          "delivery_radius",
          "operating_hours",
        ],
      });

      if (outlets.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No active outlets found",
        });
      }

      // Calculate distances and find nearest
      let nearestOutlet = null;
      let minDistance = Infinity;

      outlets.forEach((outlet) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          parseFloat(outlet.latitude),
          parseFloat(outlet.longitude)
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestOutlet = {
            ...outlet.toJSON(),
            distance: Math.round(distance * 100) / 100,
          };
        }
      });

      res.json({
        success: true,
        data: {
          outlet: nearestOutlet,
          userLocation: { latitude: userLat, longitude: userLng },
        },
      });
    } catch (error) {
      console.error("Error finding nearest outlet:", error);
      res.status(500).json({
        success: false,
        message: "Failed to find nearest outlet",
        error: error.message,
      });
    }
  }

  // Get all brands available at specific outlet
  async getOutletBrands(req, res) {
    try {
      const { id } = req.params;

      const outlet = await Outlet.findByPk(id, {
        where: {
          is_active: true,
        },
        include: [
          {
            model: Brand,
            as: "Brands",
            through: {
              model: OutletBrand,
              where: { is_available: true },
              attributes: [
                "is_available",
                "preparation_time",
                "minimum_order_amount",
                "delivery_fee",
              ],
            },
            where: {
              is_active: true,
            },
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
            required: false, // LEFT JOIN - include outlet even if no brands
          },
        ],
        attributes: [
          "id",
          "name",
          "address",
          "city",
          "state",
          "delivery_radius",
          "operating_hours",
        ],
      });

      if (!outlet) {
        return res.status(404).json({
          success: false,
          message: "Outlet not found",
        });
      }

      res.json({
        success: true,
        data: {
          outlet: {
            id: outlet.id,
            name: outlet.name,
            address: outlet.address,
            city: outlet.city,
            state: outlet.state,
            delivery_radius: outlet.delivery_radius,
            operating_hours: outlet.operating_hours,
          },
          brands: outlet.Brands || [],
          totalBrands: (outlet.Brands || []).length,
        },
      });
    } catch (error) {
      console.error("Error fetching outlet brands:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch outlet brands",
        error: error.message,
      });
    }
  }
}

const outletController = new OutletController();

module.exports = {
  findNearestOutlet: outletController.findNearestOutlet.bind(outletController),
  findNearbyOutlets: outletController.findNearbyOutlets.bind(outletController),
  getOutletById: outletController.getOutletById.bind(outletController),
  getOutletBrands: outletController.getOutletBrands.bind(outletController),
  checkDeliveryAvailability:
    outletController.checkDeliveryAvailability.bind(outletController),
};
