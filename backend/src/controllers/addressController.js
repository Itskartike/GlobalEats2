const Address = require("../models/Address");
const User = require("../models/User");
const { Op } = require("sequelize");

const addressController = {
  // GET /api/addresses - Get user's saved addresses
  getAddresses: async (req, res) => {
    try {
      const userId = req.user.id;

      const addresses = await Address.findByUser(userId);

      res.status(200).json({
        success: true,
        message: "Addresses retrieved successfully",
        data: addresses,
      });
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve addresses",
        error: error.message,
      });
    }
  },

  // POST /api/addresses - Save new address (with lat/lng from map)
  createAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        label,
        recipient_name,
        phone,
        street_address,
        apartment,
        city,
        state,
        pincode,
        country,
        latitude,
        longitude,
        address_type,
        landmark,
        instructions,
        is_default,
      } = req.body;

      // Validate required fields
      if (
        !label ||
        !recipient_name ||
        !phone ||
        !street_address ||
        !city ||
        !state ||
        !pincode
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Required fields missing: label, recipient_name, phone, street_address, city, state, pincode",
        });
      }

      // Validate coordinates if provided
      if (latitude && longitude) {
        if (isNaN(latitude) || isNaN(longitude)) {
          return res.status(400).json({
            success: false,
            message: "Invalid latitude or longitude coordinates",
          });
        }
      }

      const addressData = {
        user_id: userId,
        label,
        recipient_name,
        phone,
        street_address,
        apartment: apartment || null,
        city,
        state,
        pincode,
        country: country || "India",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address_type: address_type || "home",
        landmark: landmark || null,
        instructions: instructions || null,
      };

      let newAddress;

      // If this should be default or is the first address
      if (is_default) {
        // Remove default from other addresses
        await Address.update(
          { is_default: false },
          { where: { user_id: userId } }
        );
        addressData.is_default = true;
        newAddress = await Address.create(addressData);
      } else {
        newAddress = await Address.createDefault(userId, addressData);
      }

      res.status(201).json({
        success: true,
        message: "Address created successfully",
        data: newAddress,
      });
    } catch (error) {
      console.error("Create address error:", error);

      // Handle validation errors
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create address",
        error: error.message,
      });
    }
  },

  // GET /api/addresses/:id - Get specific address
  getAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;

      const address = await Address.findOne({
        where: {
          id: addressId,
          user_id: userId,
          is_active: true,
        },
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Address retrieved successfully",
        data: address,
      });
    } catch (error) {
      console.error("Get address error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve address",
        error: error.message,
      });
    }
  },

  // PUT /api/addresses/:id - Update address
  updateAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      const {
        label,
        recipient_name,
        phone,
        street_address,
        apartment,
        city,
        state,
        pincode,
        country,
        latitude,
        longitude,
        address_type,
        landmark,
        instructions,
      } = req.body;

      const address = await Address.findOne({
        where: {
          id: addressId,
          user_id: userId,
          is_active: true,
        },
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      // Validate coordinates if provided
      if (latitude && longitude) {
        if (isNaN(latitude) || isNaN(longitude)) {
          return res.status(400).json({
            success: false,
            message: "Invalid latitude or longitude coordinates",
          });
        }
      }

      const updateData = {
        label: label || address.label,
        recipient_name: recipient_name || address.recipient_name,
        phone: phone || address.phone,
        street_address: street_address || address.street_address,
        apartment: apartment !== undefined ? apartment : address.apartment,
        city: city || address.city,
        state: state || address.state,
        pincode: pincode || address.pincode,
        country: country || address.country,
        latitude:
          latitude !== undefined
            ? latitude
              ? parseFloat(latitude)
              : null
            : address.latitude,
        longitude:
          longitude !== undefined
            ? longitude
              ? parseFloat(longitude)
              : null
            : address.longitude,
        address_type: address_type || address.address_type,
        landmark: landmark !== undefined ? landmark : address.landmark,
        instructions:
          instructions !== undefined ? instructions : address.instructions,
      };

      await address.update(updateData);

      res.status(200).json({
        success: true,
        message: "Address updated successfully",
        data: address,
      });
    } catch (error) {
      console.error("Update address error:", error);

      // Handle validation errors
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update address",
        error: error.message,
      });
    }
  },

  // DELETE /api/addresses/:id - Delete address (soft delete)
  deleteAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;

      const address = await Address.findOne({
        where: {
          id: addressId,
          user_id: userId,
          is_active: true,
        },
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      // Soft delete
      await address.update({ is_active: false });

      // If this was the default address, make another address default
      if (address.is_default) {
        const nextAddress = await Address.findOne({
          where: {
            user_id: userId,
            is_active: true,
            id: { [Op.ne]: addressId },
          },
          order: [["created_at", "ASC"]],
        });

        if (nextAddress) {
          await nextAddress.update({ is_default: true });
        }
      }

      res.status(200).json({
        success: true,
        message: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete address",
        error: error.message,
      });
    }
  },

  // PATCH /api/addresses/:id/default - Set as default address
  setDefaultAddress: async (req, res) => {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;

      const address = await Address.findOne({
        where: {
          id: addressId,
          user_id: userId,
          is_active: true,
        },
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      await address.setAsDefault();

      res.status(200).json({
        success: true,
        message: "Address set as default successfully",
        data: address,
      });
    } catch (error) {
      console.error("Set default address error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set default address",
        error: error.message,
      });
    }
  },

  // GET /api/addresses/default - Get user's default address
  getDefaultAddress: async (req, res) => {
    try {
      const userId = req.user.id;

      const defaultAddress = await Address.findDefaultByUser(userId);

      if (!defaultAddress) {
        return res.status(404).json({
          success: false,
          message: "No default address found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Default address retrieved successfully",
        data: defaultAddress,
      });
    } catch (error) {
      console.error("Get default address error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve default address",
        error: error.message,
      });
    }
  },

  // POST /api/addresses/validate-coordinates - Validate lat/lng coordinates
  validateCoordinates: async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Basic coordinate validation
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          success: false,
          message: "Invalid coordinates format",
        });
      }

      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: "Coordinates out of valid range",
        });
      }

      res.status(200).json({
        success: true,
        message: "Coordinates are valid",
        data: {
          latitude: lat,
          longitude: lng,
        },
      });
    } catch (error) {
      console.error("Validate coordinates error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate coordinates",
        error: error.message,
      });
    }
  },
};

module.exports = addressController;
