const express = require("express");
const router = express.Router();
const {
  Brand,
  Outlet,
  Category,
  MenuItem,
  OutletMenuItem,
  OutletBrand,
  BrandCategory,
} = require("../models/associations");
const { Op } = require("sequelize");

// Get menu for a specific outlet
router.get("/outlet/:outletId", async (req, res) => {
  try {
    const { outletId } = req.params;
    const { category } = req.query;

    console.log(`🔍 Fetching menu for outlet ${outletId}`);

    // Build where clause for category filtering
    let whereClause = {};
    if (category) {
      whereClause.name = category;
    }

    // Get outlet with its menu items
    const outlet = await Outlet.findByPk(outletId, {
      include: [
        {
          model: Brand,
          as: "Brands",
          through: {
            model: OutletBrand,
            where: { is_available: true },
            attributes: [],
          },
          where: { is_active: true },
          attributes: ["id", "name", "slug", "logo_url"],
          required: false,
        },
        {
          model: MenuItem,
          as: "availableMenuItems",
          through: {
            model: OutletMenuItem,
            where: { is_available: true },
            attributes: ["outlet_price", "is_available"],
          },
          where: whereClause,
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
          ],
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

    if (!outlet) {
      console.log(`❌ Outlet ${outletId} not found`);
      return res.status(404).json({
        success: false,
        message: "Outlet not found",
      });
    }

    console.log(`✅ Found outlet: ${outlet.name}`);
    console.log(
      `📋 Available menu items: ${outlet.availableMenuItems?.length || 0}`
    );

    // Transform data to group by categories
    const menuItems =
      outlet.availableMenuItems?.map((menuItem) => {
        const outletMenuItem = menuItem.OutletMenuItem;
        return {
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: outletMenuItem?.outlet_price
            ? parseFloat(outletMenuItem.outlet_price)
            : parseFloat(menuItem.base_price),
          originalPrice: null, // Not available in BrandMenuItem model
          image: menuItem.image_url,
          category: menuItem.categoryInfo?.name || "Uncategorized",
          isVeg: menuItem.is_vegetarian,
          isVegan: menuItem.is_vegan,
          isGlutenFree: menuItem.is_gluten_free,
          spiceLevel: menuItem.spice_level,
          isAvailable: outletMenuItem?.is_available || true,
          tags: [], // Not available in BrandMenuItem model
          nutritionInfo: {
            calories: menuItem.calories || 0,
            protein: 0, // Not available in BrandMenuItem model
            carbs: 0, // Not available in BrandMenuItem model
            fat: 0, // Not available in BrandMenuItem model
          },
          rating: 0, // Not available in BrandMenuItem model
          preparationTime: menuItem.preparation_time,
        };
      }) || [];

    // Group items by category
    const categories = menuItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = {
          id: category.toLowerCase().replace(/\s+/g, "-"),
          name: category,
          items: [],
        };
      }
      acc[category].items.push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        outlet: {
          id: outlet.id,
          name: outlet.name,
          address: outlet.address,
          brand:
            outlet.Brands && outlet.Brands.length > 0
              ? {
                  id: outlet.Brands[0].id,
                  name: outlet.Brands[0].name,
                  slug: outlet.Brands[0].slug,
                  logo: outlet.Brands[0].logo_url,
                }
              : null,
        },
        categories: Object.values(categories),
        totalItems: menuItems.length,
      },
    });
  } catch (error) {
    console.error("Error fetching outlet menu:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch outlet menu",
      error: error.message,
    });
  }
});

// Get available categories for an outlet
router.get("/outlet/:outletId/categories", async (req, res) => {
  try {
    const { outletId } = req.params;

    const outlet = await Outlet.findByPk(outletId, {
      include: [
        {
          model: MenuItem,
          as: "availableMenuItems",
          through: {
            model: OutletMenuItem,
            where: { is_available: true },
            attributes: [],
          },
          include: [
            {
              model: Category,
              as: "categoryInfo",
              attributes: ["id", "name"],
            },
          ],
          attributes: [],
        },
      ],
    });

    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: "Outlet not found",
      });
    }

    // Extract unique categories
    const categoriesSet = new Set();
    outlet.availableMenuItems?.forEach((menuItem) => {
      if (menuItem.categoryInfo) {
        categoriesSet.add(
          JSON.stringify({
            id: menuItem.categoryInfo.id,
            name: menuItem.categoryInfo.name,
          })
        );
      }
    });

    const categoryList = Array.from(categoriesSet).map((catStr) =>
      JSON.parse(catStr)
    );

    res.json({
      success: true,
      data: categoryList,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
});

// Search menu items in an outlet
router.get("/outlet/:outletId/search", async (req, res) => {
  try {
    const { outletId } = req.params;
    const { q, category } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    let whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ],
    };

    const outlet = await Outlet.findByPk(outletId, {
      include: [
        {
          model: MenuItem,
          as: "availableMenuItems",
          where: whereClause,
          through: {
            model: OutletMenuItem,
            where: { is_available: true },
            attributes: ["price", "is_available"],
          },
          required: false,
          attributes: [
            "id",
            "name",
            "description",
            "price",
            "original_price",
            "image",
            "is_veg",
            "tags",
            "calories",
            "rating",
          ],
          include: [
            {
              model: Category,
              as: "categoryInfo",
              attributes: ["id", "name"],
              ...(category && { where: { name: category } }),
            },
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

    const searchResults =
      outlet.availableMenuItems?.map((menuItem) => {
        const outletMenuItem = menuItem.OutletMenuItem;
        return {
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: outletMenuItem?.price
            ? parseFloat(outletMenuItem.price)
            : parseFloat(menuItem.price),
          originalPrice: menuItem.original_price
            ? parseFloat(menuItem.original_price)
            : null,
          image: menuItem.image,
          category: menuItem.categoryInfo?.name || "Uncategorized",
          isVeg: menuItem.is_veg,
          isAvailable: outletMenuItem?.is_available || true,
          tags: menuItem.tags || [],
          rating: menuItem.rating || 0,
        };
      }) || [];

    res.json({
      success: true,
      data: {
        query: q,
        results: searchResults,
        totalResults: searchResults.length,
      },
    });
  } catch (error) {
    console.error("Error searching menu:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search menu",
      error: error.message,
    });
  }
});

module.exports = router;
