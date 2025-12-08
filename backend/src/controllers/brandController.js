const {
  Brand,
  Outlet,
  OutletBrand,
  Category,
  MenuItem,
  OutletMenuItem,
} = require("../models/associations");
const { Op, Sequelize } = require("sequelize");

class BrandController {
  // Get all brands with filtering and pagination
  async getAllBrands(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        cuisine_type,
        is_featured,
        search,
        sort_by = "name",
        sort_order = "ASC",
        latitude,
        longitude,
        delivery_radius = 10,
      } = req.query;

      const offset = (page - 1) * limit;
      const where = { is_active: true };
      const include = [
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name", "image_url"],
        },
        {
          model: Outlet,
          as: "Outlets", // This uses the many-to-many relationship through OutletBrand
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
          required: false,
          attributes: [
            "id",
            "name",
            "address",
            "city",
            "latitude",
            "longitude",
            "delivery_radius",
          ],
        },
      ];

      // Apply filters
      if (category) {
        include[0].where = { id: category };
        include[0].required = true;
      }

      if (cuisine_type) {
        where.cuisine_type = { [Op.iLike]: `%${cuisine_type}%` };
      }

      if (is_featured) {
        where.is_featured = is_featured === "true";
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { cuisine_type: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Location-based filtering
      if (latitude && longitude) {
        include[1].where = {
          ...include[1].where,
          [Op.and]: Sequelize.literal(`
            (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * sin(radians(latitude)))) <= delivery_radius
          `),
        };
      }

      const { count, rows: brands } = await Brand.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset,
        order: [[sort_by, sort_order.toUpperCase()]],
        distinct: true,
      });

      // Calculate distance for each outlet if coordinates provided
      if (latitude && longitude) {
        brands.forEach((brand) => {
          brand.Outlets?.forEach((outlet) => {
            if (outlet.latitude && outlet.longitude) {
              outlet.dataValues.distance = this.calculateDistance(
                latitude,
                longitude,
                outlet.latitude,
                outlet.longitude
              );
            }
          });
        });
      }

      res.json({
        success: true,
        data: {
          brands,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_count: count,
            per_page: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get brands error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching brands",
        error: error.message,
      });
    }
  }

  // Get brand by ID or slug with outlets and menu
  async getBrandDetails(req, res) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.query;

      const where = { is_active: true };
      if (isNaN(id)) {
        where.slug = id;
      } else {
        where.id = id;
      }

      const brand = await Brand.findOne({
        where,
        include: [
          {
            model: Category,
            as: "categories",
            attributes: ["id", "name", "image_url"],
          },
          {
            model: Outlet,
            as: "Outlets", // This uses the many-to-many relationship through OutletBrand
            through: {
              model: OutletBrand,
              where: { is_available: true },
              attributes: [
                "is_available",
                "preparation_time",
                "minimum_order_amount",
                "delivery_fee",
                "priority",
              ],
            },
            where: { is_active: true },
            required: false,
            attributes: [
              "id",
              "name",
              "address",
              "city",
              "latitude",
              "longitude",
              "delivery_radius",
              "phone",
              "operating_hours",
              "is_delivery_available",
              "is_pickup_available",
            ],
          },
          {
            model: MenuItem,
            as: "menuItems",
            where: { is_available: true },
            required: false,
            include: [
              {
                model: Category,
                as: "categoryInfo",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      // Calculate distances if coordinates provided
      if (latitude && longitude && brand.Outlets) {
        brand.Outlets.forEach((outlet) => {
          if (outlet.latitude && outlet.longitude) {
            outlet.dataValues.distance = this.calculateDistance(
              latitude,
              longitude,
              outlet.latitude,
              outlet.longitude
            );
          }
        });

        // Sort outlets by distance
        brand.Outlets.sort(
          (a, b) =>
            (a.dataValues.distance || 999) - (b.dataValues.distance || 999)
        );
      }

      res.json({
        success: true,
        data: { brand },
      });
    } catch (error) {
      console.error("Get brand details error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching brand details",
        error: error.message,
      });
    }
  }

  // Get nearby outlets for a brand
  async getNearbyOutlets(req, res) {
    try {
      const { brandId } = req.params;
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      // Find outlets that have this brand through the outlet_brands junction table
      const outlets = await Outlet.findAll({
        where: {
          is_active: true,
          [Op.and]: Sequelize.literal(`
            (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * sin(radians(latitude)))) <= ${radius}
          `),
        },
        include: [
          {
            model: Brand,
            as: "Brands", // Using the many-to-many relationship
            through: {
              model: OutletBrand,
              where: {
                brand_id: brandId,
                is_available: true,
              },
              attributes: [
                "is_available",
                "preparation_time",
                "minimum_order_amount",
                "delivery_fee",
              ],
            },
            where: { id: brandId },
            required: true, // Only get outlets that have this brand
            attributes: ["id", "name", "logo_url", "average_rating"],
          },
        ],
        order: Sequelize.literal(`
          (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * sin(radians(latitude))))
        `),
      });

      // Add distance to each outlet
      outlets.forEach((outlet) => {
        outlet.dataValues.distance = this.calculateDistance(
          latitude,
          longitude,
          outlet.latitude,
          outlet.longitude
        );
      });

      res.json({
        success: true,
        data: { outlets },
      });
    } catch (error) {
      console.error("Get nearby outlets error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching nearby outlets",
        error: error.message,
      });
    }
  }

  // Get menu for specific outlet
  async getOutletMenu(req, res) {
    try {
      const { outletId } = req.params;
      const { category } = req.query;

      const where = { outlet_id: outletId, is_available: true };

      const include = [
        {
          model: MenuItem,
          as: "menuItem",
          where: { is_available: true },
          include: [
            {
              model: Category,
              as: "categoryInfo",
              attributes: ["id", "name"],
            },
          ],
        },
      ];

      if (category) {
        include[0].include[0].where = { id: category };
      }

      const outletMenuItems = await OutletMenuItem.findAll({
        where,
        include,
        order: [
          [{ model: MenuItem, as: "menuItem" }, "sort_order", "ASC"],
          [{ model: MenuItem, as: "menuItem" }, "name", "ASC"],
        ],
      });

      // Group by category
      const menuByCategory = {};
      outletMenuItems.forEach((item) => {
        const categoryName = item.menuItem.categoryInfo?.name || "Other";
        if (!menuByCategory[categoryName]) {
          menuByCategory[categoryName] = [];
        }

        const menuItem = {
          ...item.menuItem.toJSON(),
          outlet_price: item.outlet_price || item.menuItem.base_price,
          outlet_availability: item.is_available,
          stock_quantity: item.stock_quantity,
        };

        menuByCategory[categoryName].push(menuItem);
      });

      res.json({
        success: true,
        data: { menu: menuByCategory },
      });
    } catch (error) {
      console.error("Get outlet menu error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching outlet menu",
        error: error.message,
      });
    }
  }

  // Get brand-specific menu (all menu items for a brand)
  async getBrandMenu(req, res) {
    try {
      const { brandId } = req.params;
      const { category } = req.query;

      console.log(`🔍 Fetching menu for brand ${brandId}`);

      // Build where clause for category filtering
      let categoryWhereClause = {};
      if (category) {
        categoryWhereClause = {
          name: { [Op.iLike]: `%${category}%` },
        };
      }

      // Get brand with its menu items
      const whereClause = { is_active: true };

      // Check if brandId is a UUID or slug
      if (
        brandId.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        whereClause.id = brandId;
      } else {
        whereClause.slug = brandId;
      }

      const brand = await Brand.findOne({
        where: whereClause,
        include: [
          {
            model: MenuItem,
            as: "menuItems",
            where: { is_available: true },
            required: false,
            attributes: [
              "id",
              "name",
              "description",
              "base_price",
              "image_url",
              "is_vegetarian",
              "is_vegan",
              "is_gluten_free",
              "spice_level",
              "calories",
              "preparation_time",
              "sort_order",
            ],
            include: [
              {
                model: Category,
                as: "categoryInfo",
                attributes: ["id", "name"],
                where: categoryWhereClause,
                required: category ? true : false,
              },
            ],
            order: [
              ["sort_order", "ASC"],
              ["name", "ASC"],
            ],
          },
        ],
        attributes: [
          "id",
          "name",
          "slug",
          "logo_url",
          "description",
          "cuisine_type",
        ],
      });

      if (!brand) {
        console.log(`❌ Brand ${brandId} not found`);
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      console.log(`✅ Found brand: ${brand.name}`);
      console.log(`📋 Menu items: ${brand.menuItems?.length || 0}`);

      // Transform data to group by categories
      const menuByCategory = {};
      const categoryOrder = [];

      brand.menuItems?.forEach((menuItem) => {
        const categoryName = menuItem.categoryInfo?.name || "Other";

        if (!menuByCategory[categoryName]) {
          menuByCategory[categoryName] = [];
          categoryOrder.push(categoryName);
        }

        const transformedMenuItem = {
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: parseFloat(menuItem.base_price),
          image: menuItem.image_url,
          category: categoryName,
          isVeg: menuItem.is_vegetarian,
          isVegan: menuItem.is_vegan,
          isGlutenFree: menuItem.is_gluten_free,
          spiceLevel: menuItem.spice_level,
          calories: menuItem.calories,
          preparationTime: menuItem.preparation_time,
          isAvailable: true,
        };

        menuByCategory[categoryName].push(transformedMenuItem);
      });

      // Transform to array format
      const categories = categoryOrder.map((categoryName) => ({
        name: categoryName,
        items: menuByCategory[categoryName],
      }));

      res.json({
        success: true,
        data: {
          brand: {
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo_url,
            description: brand.description,
            cuisineType: brand.cuisine_type,
          },
          categories,
          totalItems: brand.menuItems?.length || 0,
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
  }

  // Helper methods
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = new BrandController();
