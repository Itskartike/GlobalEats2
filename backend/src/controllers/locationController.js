const { Op } = require('sequelize');
const { Outlet, Brand, OutletBrand, MenuItem, OutletMenuItem } = require('../models');

/**
 * Location-based brand discovery controller
 * Implements cloud kitchen model where customers see brands available in their area
 */
class LocationController {
  /**
   * Get all brands available in a specific location (within delivery radius)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBrandsNearLocation(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      // Find outlets within delivery radius using PostgreSQL's earth distance
      // Note: This assumes PostGIS extension or earth distance calculation
      const outlets = await Outlet.findAll({
        where: {
          is_active: true,
          // Using basic coordinate-based filtering
          // In production, you'd use PostGIS for accurate distance calculation
          latitude: {
            [Op.between]: [
              parseFloat(latitude) - (radius / 111), // Rough km to degree conversion
              parseFloat(latitude) + (radius / 111)
            ]
          },
          longitude: {
            [Op.between]: [
              parseFloat(longitude) - (radius / (111 * Math.cos(latitude * Math.PI / 180))),
              parseFloat(longitude) + (radius / (111 * Math.cos(latitude * Math.PI / 180)))
            ]
          }
        },
        include: [
          {
            model: Brand,
            as: 'brands', // Specify the alias to avoid confusion
            through: {
              model: OutletBrand,
              where: { is_available: true },
              attributes: ['preparation_time', 'minimum_order_amount', 'delivery_fee', 'priority']
            },
            required: true
          }
        ]
      });

      // Transform data to group by brands with their available outlets
      const brandsMap = new Map();
      
      outlets.forEach(outlet => {
        outlet.brands.forEach(brand => {
          const brandKey = brand.id;
          if (!brandsMap.has(brandKey)) {
            brandsMap.set(brandKey, {
              id: brand.id,
              name: brand.name,
              description: brand.description,
              logo_url: brand.logo_url,
              cuisine_types: brand.cuisine_types,
              rating: brand.rating,
              outlets: []
            });
          }

          const brandData = brandsMap.get(brandKey);
          const outletBrandData = brand.OutletBrand;
          
          brandData.outlets.push({
            outlet_id: outlet.id,
            outlet_name: outlet.name,
            outlet_address: outlet.address,
            latitude: outlet.latitude,
            longitude: outlet.longitude,
            preparation_time: outletBrandData.preparation_time,
            minimum_order_amount: outletBrandData.minimum_order_amount,
            delivery_fee: outletBrandData.delivery_fee,
            priority: outletBrandData.priority,
            // Calculate approximate distance (rough estimation)
            distance: this.calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              parseFloat(outlet.latitude),
              parseFloat(outlet.longitude)
            )
          });
        });
      });

      // Convert map to array and sort by brand priority and distance
      const availableBrands = Array.from(brandsMap.values()).map(brand => {
        // Sort outlets by distance and priority
        brand.outlets.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority; // Lower priority number = higher priority
          }
          return a.distance - b.distance; // Closer outlets first
        });

        return {
          ...brand,
          nearest_outlet: brand.outlets[0], // Closest/highest priority outlet
          total_outlets: brand.outlets.length,
          min_delivery_fee: Math.min(...brand.outlets.map(o => o.delivery_fee)),
          min_preparation_time: Math.min(...brand.outlets.map(o => o.preparation_time))
        };
      });

      // Sort brands by their nearest outlet distance
      availableBrands.sort((a, b) => {
        return a.nearest_outlet.distance - b.nearest_outlet.distance;
      });

      res.json({
        success: true,
        data: {
          location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
          search_radius: radius,
          brands: availableBrands,
          total_brands: availableBrands.length,
          total_outlets: outlets.length
        }
      });

    } catch (error) {
      console.error('Error fetching brands near location:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch brands',
        error: error.message
      });
    }
  }

  /**
   * Get menu for a specific brand with outlet-specific pricing
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBrandMenuWithPricing(req, res) {
    try {
      const { brandId } = req.params;
      const { latitude, longitude, outlet_id } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required'
        });
      }

      let targetOutlet;

      if (outlet_id) {
        // Use specific outlet if provided
        targetOutlet = await Outlet.findByPk(outlet_id);
      } else if (latitude && longitude) {
        // Find nearest outlet serving this brand
        targetOutlet = await this.findNearestOutletForBrand(brandId, latitude, longitude);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either outlet_id or location (latitude, longitude) is required'
        });
      }

      if (!targetOutlet) {
        return res.status(404).json({
          success: false,
          message: 'No outlet found serving this brand in your area'
        });
      }

      // Get brand details
      const brand = await Brand.findByPk(brandId);
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      // Get menu items with outlet-specific pricing
      const menuItems = await MenuItem.findAll({
        where: { brand_id: brandId },
        include: [
          {
            model: OutletMenuItem,
            where: { outlet_id: targetOutlet.id },
            required: false, // LEFT JOIN to include items without outlet-specific pricing
            attributes: ['price', 'discount_percentage', 'is_available', 'preparation_time']
          }
        ]
      });

      // Transform menu items to include outlet-specific pricing or fallback to base pricing
      const menuWithPricing = menuItems.map(item => {
        const outletItem = item.OutletMenuItems && item.OutletMenuItems[0];
        
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          base_price: item.price,
          // Use outlet-specific price if available, otherwise use base price
          price: outletItem?.price || item.price,
          discount_percentage: outletItem?.discount_percentage || 0,
          final_price: outletItem?.price 
            ? (outletItem.price * (1 - (outletItem.discount_percentage || 0) / 100))
            : item.price,
          is_available: outletItem?.is_available ?? item.is_available,
          preparation_time: outletItem?.preparation_time || item.preparation_time || 15,
          image_url: item.image_url,
          is_vegetarian: item.is_vegetarian,
          is_spicy: item.is_spicy,
          allergens: item.allergens,
          has_outlet_pricing: !!outletItem
        };
      });

      // Get outlet-brand relationship details
      const outletBrand = await OutletBrand.findOne({
        where: {
          outlet_id: targetOutlet.id,
          brand_id: brandId
        }
      });

      res.json({
        success: true,
        data: {
          brand: {
            id: brand.id,
            name: brand.name,
            description: brand.description,
            logo_url: brand.logo_url,
            cuisine_types: brand.cuisine_types,
            rating: brand.rating
          },
          outlet: {
            id: targetOutlet.id,
            name: targetOutlet.name,
            address: targetOutlet.address,
            latitude: targetOutlet.latitude,
            longitude: targetOutlet.longitude,
            phone: targetOutlet.phone,
            preparation_time: outletBrand?.preparation_time || 30,
            minimum_order_amount: outletBrand?.minimum_order_amount || 0,
            delivery_fee: outletBrand?.delivery_fee || 0
          },
          menu: {
            items: menuWithPricing,
            total_items: menuWithPricing.length,
            available_items: menuWithPricing.filter(item => item.is_available).length
          }
        }
      });

    } catch (error) {
      console.error('Error fetching brand menu with pricing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu',
        error: error.message
      });
    }
  }

  /**
   * Find the best outlet to fulfill an order for a specific brand
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async assignOutletForOrder(req, res) {
    try {
      const { brand_id, customer_latitude, customer_longitude, order_items } = req.body;

      if (!brand_id || !customer_latitude || !customer_longitude) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID and customer location are required'
        });
      }

      // Find the best outlet for this order
      const assignedOutlet = await this.findBestOutletForOrder(
        brand_id,
        customer_latitude,
        customer_longitude,
        order_items
      );

      if (!assignedOutlet) {
        return res.status(404).json({
          success: false,
          message: 'No outlet available to fulfill this order'
        });
      }

      res.json({
        success: true,
        data: {
          assigned_outlet: assignedOutlet,
          message: 'Outlet successfully assigned for order'
        }
      });

    } catch (error) {
      console.error('Error assigning outlet for order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign outlet',
        error: error.message
      });
    }
  }

  // Helper Methods
  
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  /**
   * Find nearest outlet serving a specific brand
   */
  async findNearestOutletForBrand(brandId, latitude, longitude) {
    const outlets = await Outlet.findAll({
      where: { is_active: true },
      include: [
        {
          model: Brand,
          as: 'brands',
          where: { id: brandId },
          through: {
            model: OutletBrand,
            where: { is_available: true }
          },
          required: true
        }
      ]
    });

    if (outlets.length === 0) return null;

    // Find the closest outlet
    let nearestOutlet = outlets[0];
    let minDistance = this.calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(nearestOutlet.latitude),
      parseFloat(nearestOutlet.longitude)
    );

    for (let i = 1; i < outlets.length; i++) {
      const distance = this.calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(outlets[i].latitude),
        parseFloat(outlets[i].longitude)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestOutlet = outlets[i];
      }
    }

    return nearestOutlet;
  }

  /**
   * Find the best outlet to fulfill a specific order
   */
  async findBestOutletForOrder(brandId, customerLat, customerLon, orderItems = []) {
    // Get all outlets serving this brand
    const outlets = await Outlet.findAll({
      where: { is_active: true },
      include: [
        {
          model: Brand,
          as: 'brands',
          where: { id: brandId },
          through: {
            model: OutletBrand,
            where: { is_available: true },
            attributes: ['priority', 'preparation_time', 'minimum_order_amount']
          },
          required: true
        }
      ]
    });

    if (outlets.length === 0) return null;

    // Score each outlet based on distance, priority, and preparation time
    const scoredOutlets = outlets.map(outlet => {
      const outletBrand = outlet.brands[0].OutletBrand;
      const distance = this.calculateDistance(
        parseFloat(customerLat),
        parseFloat(customerLon),
        parseFloat(outlet.latitude),
        parseFloat(outlet.longitude)
      );

      // Scoring algorithm (lower score = better)
      const distanceScore = distance; // Distance in km
      const priorityScore = outletBrand.priority * 2; // Priority weight
      const timeScore = outletBrand.preparation_time / 10; // Preparation time factor

      const totalScore = distanceScore + priorityScore + timeScore;

      return {
        outlet,
        distance,
        priority: outletBrand.priority,
        preparation_time: outletBrand.preparation_time,
        minimum_order_amount: outletBrand.minimum_order_amount,
        score: totalScore
      };
    });

    // Sort by score and return the best outlet
    scoredOutlets.sort((a, b) => a.score - b.score);
    
    const bestOutlet = scoredOutlets[0];
    return {
      id: bestOutlet.outlet.id,
      name: bestOutlet.outlet.name,
      address: bestOutlet.outlet.address,
      latitude: bestOutlet.outlet.latitude,
      longitude: bestOutlet.outlet.longitude,
      phone: bestOutlet.outlet.phone,
      distance: Math.round(bestOutlet.distance * 100) / 100,
      preparation_time: bestOutlet.preparation_time,
      minimum_order_amount: bestOutlet.minimum_order_amount,
      priority: bestOutlet.priority,
      assignment_score: Math.round(bestOutlet.score * 100) / 100
    };
  }
}

module.exports = new LocationController();
