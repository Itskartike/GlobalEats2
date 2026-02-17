const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const {
  User,
  Order,
  Brand,
  Outlet,
  OutletBrand,
  Category,
  BrandCategory,
  MenuItem,
  OrderItem,
  Address,
} = require("../models/associations");
const { sequelize } = require("../database/config/database");
const { QueryTypes } = require("sequelize");
const { adminAuth } = require("./adminAuth");

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Dashboard Metrics (Protected Route)
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    // Get dashboard statistics
    const [totalUsers, totalOrders, totalBrands, totalOutlets, todayOrders] =
      await Promise.all([
        User.count({ where: { role: "customer" } }),
        Order.count(),
        Brand.count(),
        Outlet.count(),
        Order.count({
          where: {
            created_at: {
              [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

    // Get recent orders
    const recentOrders = await Order.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      attributes: ["id", "order_number", "status", "total_amount", "created_at"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email"],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOrders,
          totalBrands,
          totalOutlets,
          todayOrders,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
});

// Admin Outlets Management
router.get("/outlets", adminAuth, async (req, res) => {
  try {
    const outlets = await Outlet.findAll({
      include: [
        {
          model: Brand,
          as: "Brands",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: outlets,
    });
  } catch (error) {
    console.error("Admin outlets fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch outlets",
    });
  }
});

router.post("/outlets", adminAuth, async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      postal_code,
      latitude,
      longitude,
      phone,
      email,
      opening_time,
      closing_time,
      delivery_radius,
      is_active,
    } = req.body;

    // Validation
    if (!name || !address || !city || !state || !postal_code) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, address, city, state, postal_code",
      });
    }

    const outlet = await Outlet.create({
      name,
      address,
      city,
      state,
      postal_code,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone: phone || null,
      email: email || null,
      opening_time,
      closing_time,
      delivery_radius: delivery_radius ? parseFloat(delivery_radius) : 5,
      is_active: is_active !== false,
    });

    // Fetch the created outlet with brand info
    const createdOutlet = await Outlet.findByPk(outlet.id, {
      include: [
        {
          model: Brand,
          as: "Brands",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Outlet created successfully",
      data: createdOutlet,
    });
  } catch (error) {
    console.error("Admin outlet creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create outlet",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

router.put("/outlets/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      city,
      state,
      postal_code,
      latitude,
      longitude,
      phone,
      email,
      opening_time,
      closing_time,
      delivery_radius,
      is_active,
    } = req.body;

    const outlet = await Outlet.findByPk(id);
    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: "Outlet not found",
      });
    }

    await outlet.update({
      name,
      address,
      city,
      state,
      postal_code,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone: phone || null,
      email: email || null,
      opening_time,
      closing_time,
      delivery_radius: delivery_radius ? parseFloat(delivery_radius) : outlet.delivery_radius,
      is_active,
    });

    // Fetch updated outlet with brand info
    const updatedOutlet = await Outlet.findByPk(id, {
      include: [
        {
          model: Brand,
          as: "Brands",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Outlet updated successfully",
      data: updatedOutlet,
    });
  } catch (error) {
    console.error("Admin outlet update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update outlet",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

router.delete("/outlets/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id);
    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: "Outlet not found",
      });
    }

    // Check for active/pending orders before deletion
    const activeOrdersCount = await Order.count({
      where: {
        outlet_id: id,
        status: { [Op.notIn]: ['delivered', 'cancelled', 'refunded'] },
      },
    });
    if (activeOrdersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete outlet with ${activeOrdersCount} active order(s). Complete or cancel all orders first.`,
      });
    }

    await outlet.destroy();

    res.json({
      success: true,
      message: "Outlet deleted successfully",
    });
  } catch (error) {
    console.error("Admin outlet deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete outlet",
    });
  }
});

// Admin Brands Management
router.get("/brands/manage", adminAuth, async (req, res) => {
  try {
    const brands = await Brand.findAll({
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Admin brands fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
});

router.post("/brands", adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      logo_url,
      banner_url,
      cuisine_type,
      delivery_time,
      is_active,
      categories,
    } = req.body;

    // Validation
    if (!name || !description || !cuisine_type || !delivery_time) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Generate unique slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    
    // Check if slug already exists and make it unique
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const existingBrand = await Brand.findOne({ where: { slug } });
      if (!existingBrand) break;
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    // Create brand
    const brand = await Brand.create({
      name,
      slug,
      description,
      logo_url,
      banner_url,
      cuisine_type,
      estimated_delivery_time: parseInt(delivery_time) || 30,
      is_active: is_active !== false,
    });

    // Associate categories if provided
    if (categories && categories.length > 0) {
      await brand.setCategories(categories);
    }

    // Fetch the created brand with categories
    const createdBrand = await Brand.findByPk(brand.id, {
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: createdBrand,
    });
  } catch (error) {
    console.error("Admin brand creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create brand",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

router.put("/brands/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      logo_url,
      banner_url,
      cuisine_type,
      delivery_time,
      is_active,
      categories,
    } = req.body;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Generate new slug if name changed
    let slug = brand.slug;
    if (name && name !== brand.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      
      // Check if slug already exists and make it unique
      let counter = 1;
      let originalSlug = slug;
      while (true) {
        const existingBrand = await Brand.findOne({ where: { slug, id: { [Op.ne]: id } } });
        if (!existingBrand) break;
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    await brand.update({
      name,
      slug,
      description,
      logo_url,
      banner_url,
      cuisine_type,
      estimated_delivery_time: delivery_time ? parseInt(delivery_time) : brand.estimated_delivery_time,
      is_active,
    });

    // Update categories if provided
    if (categories) {
      await brand.setCategories(categories);
    }

    // Fetch updated brand with categories
    const updatedBrand = await Brand.findByPk(id, {
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    res.json({
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    console.error("Admin brand update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update brand",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

router.delete("/brands/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Check if brand has outlets (via OutletBrand junction table)
    const outletsCount = await OutletBrand.count({ where: { brand_id: id } });
    if (outletsCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete brand that is associated with outlets. Remove outlet associations first.",
      });
    }

    // Check if brand has menu items
    const menuItemsCount = await MenuItem.count({ where: { brand_id: id } });
    if (menuItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete brand that has menu items. Delete menu items first.",
      });
    }

    await brand.destroy();

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Admin brand deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete brand",
    });
  }
});

// ==================== OUTLET-BRAND MANAGEMENT ENDPOINTS ====================

// Get all outlet-brand associations with pagination
router.get("/outlet-brands", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { address: { [Op.iLike]: `%${search}%` } },
            { city: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Outlet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Brand,
          as: "Brands",
          through: {
            model: OutletBrand,
            as: "OutletBrand",
            attributes: [
              "is_available",
              "preparation_time",
              "minimum_order_amount",
              "delivery_fee",
              "priority",
              "created_at",
            ],
          },
          attributes: [
            "id",
            "name",
            "slug",
            "logo_url",
            "cuisine_type",
            "average_rating",
          ],
        },
      ],
      limit,
      offset,
      order: [["name", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        outlets: rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get outlet brands error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch outlet-brand associations",
    });
  }
});

// Get all brands for dropdown
router.get("/brands", adminAuth, async (req, res) => {
  try {
    const brands = await Brand.findAll({
      where: { is_active: true },
      attributes: ["id", "name", "slug", "logo_url"],
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: {
        brands,
      },
    });
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
});

// Add brand to outlet
router.post("/outlets/:outletId/brands", adminAuth, async (req, res) => {
  try {
    const { outletId } = req.params;
    const {
      brand_id,
      is_available = true,
      preparation_time = 30,
      minimum_order_amount = 0,
      delivery_fee = 0,
      priority = 1,
    } = req.body;

    if (!brand_id) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is required",
      });
    }

    // Check if outlet exists
    const outlet = await Outlet.findByPk(outletId);
    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: "Outlet not found",
      });
    }

    // Check if brand exists
    const brand = await Brand.findByPk(brand_id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Check if association already exists
    const existingAssociation = await OutletBrand.findOne({
      where: { outlet_id: outletId, brand_id },
    });

    if (existingAssociation) {
      return res.status(400).json({
        success: false,
        message: "Brand is already associated with this outlet",
      });
    }

    // Create association
    await OutletBrand.create({
      outlet_id: outletId,
      brand_id,
      is_available,
      preparation_time,
      minimum_order_amount,
      delivery_fee,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Brand added to outlet successfully",
    });
  } catch (error) {
    console.error("Add brand to outlet error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add brand to outlet",
    });
  }
});

// Update outlet-brand association
router.patch(
  "/outlets/:outletId/brands/:brandId",
  adminAuth,
  async (req, res) => {
    try {
      const { outletId, brandId } = req.params;
      const {
        is_available,
        preparation_time,
        minimum_order_amount,
        delivery_fee,
        priority,
      } = req.body;

      const association = await OutletBrand.findOne({
        where: { outlet_id: outletId, brand_id: brandId },
      });

      if (!association) {
        return res.status(404).json({
          success: false,
          message: "Outlet-brand association not found",
        });
      }

      const updateData = {};
      if (is_available !== undefined) updateData.is_available = is_available;
      if (preparation_time !== undefined)
        updateData.preparation_time = preparation_time;
      if (minimum_order_amount !== undefined)
        updateData.minimum_order_amount = minimum_order_amount;
      if (delivery_fee !== undefined) updateData.delivery_fee = delivery_fee;
      if (priority !== undefined) updateData.priority = priority;

      await association.update(updateData);

      res.json({
        success: true,
        message: "Outlet-brand association updated successfully",
      });
    } catch (error) {
      console.error("Update outlet-brand error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update outlet-brand association",
      });
    }
  }
);

// Remove brand from outlet
router.delete(
  "/outlets/:outletId/brands/:brandId",
  adminAuth,
  async (req, res) => {
    try {
      const { outletId, brandId } = req.params;

      const association = await OutletBrand.findOne({
        where: { outlet_id: outletId, brand_id: brandId },
      });

      if (!association) {
        return res.status(404).json({
          success: false,
          message: "Outlet-brand association not found",
        });
      }

      await association.destroy();

      res.json({
        success: true,
        message: "Brand removed from outlet successfully",
      });
    } catch (error) {
      console.error("Remove brand from outlet error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove brand from outlet",
      });
    }
  }
);

// ==================== CATEGORY MANAGEMENT ====================

// GET /admin/categories - Get all categories
router.get("/categories", adminAuth, async (req, res) => {
  try {
    const { active } = req.query;
    const where = {};
    if (active === "true") {
      where.is_active = true;
    }

    const categories = await Category.findAll({
      where,
      order: [["sort_order", "ASC"], ["name", "ASC"]],
      attributes: ["id", "name", "description", "image_url", "is_active", "sort_order", "created_at", "updated_at"],
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// POST /admin/categories - Create new category
router.post("/categories", adminAuth, async (req, res) => {
  try {
    const { name, description, image_url, is_active, sort_order } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await Category.create({
      name,
      description: description || null,
      image_url: image_url || null,
      is_active: is_active !== undefined ? is_active : true,
      sort_order: sort_order || 0,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// PUT /admin/categories/:id - Update category
router.put("/categories/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, is_active, sort_order } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        where: { name, id: { [Op.ne]: id } } 
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      image_url: image_url !== undefined ? image_url : category.image_url,
      is_active: is_active !== undefined ? is_active : category.is_active,
      sort_order: sort_order !== undefined ? sort_order : category.sort_order,
    });

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// DELETE /admin/categories/:id - Delete category
router.delete("/categories/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has menu items
    const menuItemCount = await MenuItem.count({ where: { category_id: id } });
    if (menuItemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${menuItemCount} menu item(s) associated with it.`,
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// ==================== MENU ITEM MANAGEMENT ====================

// GET /admin/menu-items - Get all menu items with filters
router.get("/menu-items", adminAuth, async (req, res) => {
  try {
    const { brand_id, category_id, search, page, limit: queryLimit } = req.query;
    const where = {};

    if (brand_id) {
      where.brand_id = brand_id;
    }
    if (category_id) {
      where.category_id = category_id;
    }
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Pagination with sensible defaults (cap at 500 items max)
    const limit = Math.min(parseInt(queryLimit) || 100, 500);
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const { count, rows: menuItems } = await MenuItem.findAndCountAll({
      where,
      include: [
        {
          model: Brand,
          as: "parentBrand",
          attributes: ["id", "name", "slug"],
        },
        {
          model: Category,
          as: "categoryInfo",
          attributes: ["id", "name"],
        },
      ],
      order: [["sort_order", "ASC"], ["name", "ASC"]],
      attributes: [
        "id",
        "brand_id",
        "category_id",
        "name",
        "description",
        "image_url",
        "base_price",
        "is_vegetarian",
        "is_vegan",
        "is_gluten_free",
        "spice_level",
        "calories",
        "preparation_time",
        "is_available",
        "sort_order",
        "created_at",
        "updated_at",
      ],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: menuItems,
      pagination: {
        currentPage: parseInt(page) || 1,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Menu items fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// POST /admin/menu-items - Create new menu item
router.post("/menu-items", adminAuth, async (req, res) => {
  try {
    const {
      brand_id,
      category_id,
      name,
      description,
      image_url,
      base_price,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      spice_level,
      calories,
      preparation_time,
      is_available,
      sort_order,
    } = req.body;

    // Validate required fields
    if (!brand_id || !category_id || !name || base_price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Brand, category, name, and base price are required",
      });
    }

    // Verify brand exists
    const brand = await Brand.findByPk(brand_id);
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Verify category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if menu item name already exists for this brand
    const existingMenuItem = await MenuItem.findOne({
      where: { name, brand_id },
    });
    if (existingMenuItem) {
      return res.status(400).json({
        success: false,
        message: "Menu item with this name already exists for this brand",
      });
    }

    const menuItem = await MenuItem.create({
      brand_id,
      category_id,
      name,
      description: description || null,
      image_url: image_url || null,
      base_price: parseFloat(base_price),
      is_vegetarian: is_vegetarian || false,
      is_vegan: is_vegan || false,
      is_gluten_free: is_gluten_free || false,
      spice_level: spice_level || 0,
      calories: calories || null,
      preparation_time: preparation_time || 15,
      is_available: is_available !== undefined ? is_available : true,
      sort_order: sort_order || 0,
    });

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
    });
  } catch (error) {
    console.error("Create menu item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// PUT /admin/menu-items/:id - Update menu item
router.put("/menu-items/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brand_id,
      category_id,
      name,
      description,
      image_url,
      base_price,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      spice_level,
      calories,
      preparation_time,
      is_available,
      sort_order,
    } = req.body;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Verify brand exists if being changed
    if (brand_id && brand_id !== menuItem.brand_id) {
      const brand = await Brand.findByPk(brand_id);
      if (!brand) {
        return res.status(400).json({
          success: false,
          message: "Brand not found",
        });
      }
    }

    // Verify category exists if being changed
    if (category_id && category_id !== menuItem.category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== menuItem.name) {
      const existingMenuItem = await MenuItem.findOne({
        where: { name, brand_id: brand_id || menuItem.brand_id, id: { [Op.ne]: id } },
      });
      if (existingMenuItem) {
        return res.status(400).json({
          success: false,
          message: "Menu item with this name already exists for this brand",
        });
      }
    }

    await menuItem.update({
      brand_id: brand_id || menuItem.brand_id,
      category_id: category_id || menuItem.category_id,
      name: name || menuItem.name,
      description: description !== undefined ? description : menuItem.description,
      image_url: image_url !== undefined ? image_url : menuItem.image_url,
      base_price: base_price !== undefined ? parseFloat(base_price) : menuItem.base_price,
      is_vegetarian: is_vegetarian !== undefined ? is_vegetarian : menuItem.is_vegetarian,
      is_vegan: is_vegan !== undefined ? is_vegan : menuItem.is_vegan,
      is_gluten_free: is_gluten_free !== undefined ? is_gluten_free : menuItem.is_gluten_free,
      spice_level: spice_level !== undefined ? spice_level : menuItem.spice_level,
      calories: calories !== undefined ? calories : menuItem.calories,
      preparation_time: preparation_time !== undefined ? preparation_time : menuItem.preparation_time,
      is_available: is_available !== undefined ? is_available : menuItem.is_available,
      sort_order: sort_order !== undefined ? sort_order : menuItem.sort_order,
    });

    res.json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// DELETE /admin/menu-items/:id - Delete menu item
router.delete("/menu-items/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    await menuItem.destroy();

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// ==================== ORDER MANAGEMENT ====================

// GET /admin/orders/analytics - Get order analytics (MUST BE BEFORE /orders/:id)
router.get("/orders/analytics", adminAuth, async (req, res) => {
  try {
    const { period = "today" } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case "today": {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        dateFilter = { [Op.gte]: startOfDay };
        break;
      }
      case "week": {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { [Op.gte]: weekAgo };
        break;
      }
      case "month": {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { [Op.gte]: monthAgo };
        break;
      }
      default: {
        // Default to today if invalid period
        const defaultStart = new Date(now);
        defaultStart.setHours(0, 0, 0, 0);
        dateFilter = { [Op.gte]: defaultStart };
        break;
      }
    }

    // Get order counts by status using raw SQL
    const statusCountsQuery = `
      SELECT status, COUNT(*) as count 
      FROM orders 
      WHERE created_at >= :dateFilter 
      GROUP BY status
    `;
    const statusCounts = await sequelize.query(statusCountsQuery, {
      replacements: { dateFilter: dateFilter[Op.gte] },
      type: QueryTypes.SELECT
    });

    // Get total revenue using raw SQL
    const revenueQuery = `
      SELECT SUM(total_amount) as total_revenue 
      FROM orders 
      WHERE created_at >= :dateFilter 
      AND status IN ('delivered', 'picked_up')
    `;
    const revenueResult = await sequelize.query(revenueQuery, {
      replacements: { dateFilter: dateFilter[Op.gte] },
      type: QueryTypes.SELECT
    });

    // Get average order value using raw SQL
    const avgOrderValueQuery = `
      SELECT AVG(total_amount) as avg_value 
      FROM orders 
      WHERE created_at >= :dateFilter 
      AND status IN ('delivered', 'picked_up')
    `;
    const avgOrderValue = await sequelize.query(avgOrderValueQuery, {
      replacements: { dateFilter: dateFilter[Op.gte] },
      type: QueryTypes.SELECT
    });

    // Get orders by outlet using raw SQL
    const outletStatsQuery = `
      SELECT 
        o.outlet_id,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as revenue,
        out.name as outlet_name
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      WHERE o.created_at >= :dateFilter
      GROUP BY o.outlet_id, out.name
      ORDER BY order_count DESC
    `;
    const outletStats = await sequelize.query(outletStatsQuery, {
      replacements: { dateFilter: dateFilter[Op.gte] },
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        period,
        statusCounts: statusCounts.map(item => ({
          status: item.status,
          count: item.count.toString()
        })),
        totalRevenue: parseFloat(revenueResult[0]?.total_revenue || 0),
        averageOrderValue: parseFloat(avgOrderValue[0]?.avg_value || 0),
        outletStats: outletStats.map(item => ({
          outlet_id: item.outlet_id,
          order_count: item.order_count.toString(),
          revenue: item.revenue.toString(),
          outlet: {
            id: item.outlet_id,
            name: item.outlet_name
          }
        })),
      },
    });
  } catch (error) {
    console.error("Order analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order analytics",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// GET /admin/orders - Get all orders with filters
router.get("/orders", adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      outlet_id, 
      user_id, 
      search, 
      date_from, 
      date_to,
      order_type 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Apply filters
    if (status) {
      where.status = status;
    }
    if (outlet_id) {
      where.outlet_id = outlet_id;
    }
    if (user_id) {
      where.user_id = user_id;
    }
    if (order_type) {
      where.order_type = order_type;
    }
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) {
        where.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        where.created_at[Op.lte] = new Date(date_to);
      }
    }

    // Build search conditions in SQL instead of post-query filtering
    const include = [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "phone"],
        ...(search ? { where: { [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ] }, required: false } : {}),
      },
      {
        model: Outlet,
        as: "outlet",
        attributes: ["id", "name", "address", "phone"],
      },
      {
        model: Address,
        as: "address",
        attributes: ["id", "street_address", "city", "state", "pincode"],
      },
      {
        model: OrderItem,
        as: "orderItems",
        include: [
          {
            model: MenuItem,
            as: "menuItem",
            attributes: ["id", "name", "base_price"],
          },
        ],
      },
    ];

    // If searching, add order_number to main where OR make user required
    if (search) {
      where[Op.or] = [
        { order_number: { [Op.iLike]: `%${search}%` } },
        { '$user.name$': { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } },
      ];
      // Reset the user include to not have its own where (use subquery instead)
      include[0] = {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "phone"],
      };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      attributes: [
        "id", "order_number", "status", "order_type", "subtotal", 
        "delivery_fee", "tax_amount", "discount_amount", "total_amount", 
        "payment_status", "payment_method", "special_instructions", 
        "estimated_delivery_time", "actual_delivery_time", "preparation_time", 
        "delivery_time", "created_at", "updated_at"
      ],
      include,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
      distinct: true,
      subQuery: false,
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// GET /admin/orders/:id - Get specific order details
router.get("/orders/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      attributes: [
        "id", "order_number", "status", "order_type", "subtotal", 
        "delivery_fee", "tax_amount", "discount_amount", "total_amount", 
        "payment_status", "payment_method", "special_instructions", 
        "estimated_delivery_time", "actual_delivery_time", "preparation_time", 
        "delivery_time", "created_at", "updated_at", "restaurant_notes"
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Outlet,
          as: "outlet",
          attributes: ["id", "name", "address", "phone", "city", "state"],
        },
        {
          model: Address,
          as: "address",
          attributes: ["id", "street_address", "city", "state", "pincode", "landmark"],
        },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: MenuItem,
              as: "menuItem",
              include: [
                {
                  model: Brand,
                  as: "parentBrand",
                  attributes: ["id", "name", "logo_url"],
                },
                {
                  model: Category,
                  as: "categoryInfo",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Order details fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// PUT /admin/orders/:id/status - Update order status
router.put("/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate status transition
    const validStatuses = [
      "pending", "confirmed", "preparing", "ready", 
      "picked_up", "out_for_delivery", "delivered", "cancelled", "refunded"
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Update order status
    const restaurantNotes = notes ? (typeof notes === 'string' ? { text: notes } : notes) : undefined;
    await order.updateStatus(status, restaurantNotes ? { restaurant: restaurantNotes } : {});

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: {
        id: order.id,
        status: order.status,
        updated_at: order.updated_at,
      },
    });
  } catch (error) {
    console.error("Order status update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
});

// PUT /admin/orders/:id - Update order details
router.put("/orders/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      special_instructions, 
      restaurant_notes, 
      estimated_delivery_time,
      preparation_time,
      delivery_time 
    } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order details
    const updateData = {};
    if (special_instructions !== undefined) updateData.special_instructions = special_instructions;
    if (estimated_delivery_time !== undefined) updateData.estimated_delivery_time = estimated_delivery_time;
    if (preparation_time !== undefined) updateData.preparation_time = preparation_time;
    if (delivery_time !== undefined) updateData.delivery_time = delivery_time;
    if (restaurant_notes !== undefined) {
      // Ensure restaurant_notes is an object before spreading
      const notesObj = typeof restaurant_notes === 'string' 
        ? { text: restaurant_notes } 
        : restaurant_notes;
      updateData.restaurant_notes = { ...(order.restaurant_notes || {}), ...notesObj };
    }

    await order.update(updateData);

    res.json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Order update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});


module.exports = router;
