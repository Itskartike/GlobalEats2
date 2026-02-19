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
  VendorProfile,
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

// Dashboard Metrics — Platform Command Center (Protected Route)
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Core stats + Vendor health + Revenue + Live ops — all parallel
    const [
      totalUsers, totalOrders, totalBrands, totalOutlets, todayOrders,
      totalVendors, pendingVendors, approvedVendors, suspendedVendors,
      totalGMV, todayGMV,
      pendingOrders, confirmedOrders, preparingOrders, readyOrders, outForDeliveryOrders,
      newVendorsWeek, newVendorsMonth, newCustomersWeek, newCustomersMonth,
      ordersWeek, ordersMonth,
      cancelledToday,
    ] = await Promise.all([
      User.count({ where: { role: "customer" } }),
      Order.count(),
      Brand.count(),
      Outlet.count(),
      Order.count({ where: { created_at: { [Op.gte]: today } } }),
      // Vendor health
      VendorProfile.count(),
      VendorProfile.count({ where: { status: "pending" } }),
      VendorProfile.count({ where: { status: "approved" } }),
      VendorProfile.count({ where: { status: "suspended" } }),
      // Revenue
      Order.sum("total_amount", { where: { status: "delivered" } }),
      Order.sum("total_amount", { where: { status: "delivered", created_at: { [Op.gte]: today } } }),
      // Live order pipeline
      Order.count({ where: { status: "pending" } }),
      Order.count({ where: { status: "confirmed" } }),
      Order.count({ where: { status: "preparing" } }),
      Order.count({ where: { status: "ready" } }),
      Order.count({ where: { status: "out_for_delivery" } }),
      // Growth metrics
      VendorProfile.count({ where: { created_at: { [Op.gte]: weekAgo } } }),
      VendorProfile.count({ where: { created_at: { [Op.gte]: monthAgo } } }),
      User.count({ where: { role: "customer", created_at: { [Op.gte]: weekAgo } } }),
      User.count({ where: { role: "customer", created_at: { [Op.gte]: monthAgo } } }),
      Order.count({ where: { created_at: { [Op.gte]: weekAgo } } }),
      Order.count({ where: { created_at: { [Op.gte]: monthAgo } } }),
      // Cancellations today
      Order.count({ where: { status: "cancelled", created_at: { [Op.gte]: today } } }),
    ]);

    // Estimate platform commission
    const avgCommission = await VendorProfile.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("commission_rate")), "avg_rate"]],
      where: { status: "approved" },
      raw: true,
    });
    const avgRate = parseFloat(avgCommission?.avg_rate || "15");
    const totalCommission = Math.round(((totalGMV || 0) * avgRate / 100) * 100) / 100;
    const todayCommission = Math.round(((todayGMV || 0) * avgRate / 100) * 100) / 100;

    // Recent orders with outlet+vendor info
    const recentOrders = await Order.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      attributes: ["id", "order_number", "status", "total_amount", "created_at"],
      include: [
        { model: User, as: "user", attributes: ["name", "email"] },
        {
          model: Outlet, as: "outlet",
          attributes: ["id", "name", "owner_id"],
          include: [{ model: User, as: "owner", attributes: ["name"] }],
        },
      ],
    });

    // Alerts
    const alerts = [];
    if (pendingVendors > 0) alerts.push({ type: "warning", message: `${pendingVendors} vendor(s) awaiting approval` });
    if (cancelledToday > 3) alerts.push({ type: "danger", message: `${cancelledToday} orders cancelled today` });
    const stuckOrders = await Order.count({
      where: { status: "pending", created_at: { [Op.lt]: new Date(Date.now() - 15 * 60 * 1000) } },
    });
    if (stuckOrders > 0) alerts.push({ type: "danger", message: `${stuckOrders} order(s) stuck as pending >15min` });

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalOrders, totalBrands, totalOutlets, todayOrders },
        vendorHealth: { totalVendors, pendingVendors, approvedVendors, suspendedVendors },
        revenue: {
          totalGMV: totalGMV || 0, todayGMV: todayGMV || 0,
          totalCommission, todayCommission, avgCommissionRate: avgRate,
        },
        liveOps: { pendingOrders, confirmedOrders, preparingOrders, readyOrders, outForDeliveryOrders },
        growth: { newVendorsWeek, newVendorsMonth, newCustomersWeek, newCustomersMonth, ordersWeek, ordersMonth },
        alerts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
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
      delivery_radius: delivery_radius
        ? parseFloat(delivery_radius)
        : outlet.delivery_radius,
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
        status: { [Op.notIn]: ["delivered", "cancelled", "refunded"] },
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
        const existingBrand = await Brand.findOne({
          where: { slug, id: { [Op.ne]: id } },
        });
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
      estimated_delivery_time: delivery_time
        ? parseInt(delivery_time)
        : brand.estimated_delivery_time,
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
      order: [
        ["sort_order", "ASC"],
        ["name", "ASC"],
      ],
      attributes: [
        "id",
        "name",
        "description",
        "image_url",
        "is_active",
        "sort_order",
        "created_at",
        "updated_at",
      ],
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
        where: { name, id: { [Op.ne]: id } },
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
      description:
        description !== undefined ? description : category.description,
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
    const {
      brand_id,
      category_id,
      search,
      page,
      limit: queryLimit,
    } = req.query;
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
      order: [
        ["sort_order", "ASC"],
        ["name", "ASC"],
      ],
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
        where: {
          name,
          brand_id: brand_id || menuItem.brand_id,
          id: { [Op.ne]: id },
        },
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
      description:
        description !== undefined ? description : menuItem.description,
      image_url: image_url !== undefined ? image_url : menuItem.image_url,
      base_price:
        base_price !== undefined ? parseFloat(base_price) : menuItem.base_price,
      is_vegetarian:
        is_vegetarian !== undefined ? is_vegetarian : menuItem.is_vegetarian,
      is_vegan: is_vegan !== undefined ? is_vegan : menuItem.is_vegan,
      is_gluten_free:
        is_gluten_free !== undefined ? is_gluten_free : menuItem.is_gluten_free,
      spice_level:
        spice_level !== undefined ? spice_level : menuItem.spice_level,
      calories: calories !== undefined ? calories : menuItem.calories,
      preparation_time:
        preparation_time !== undefined
          ? preparation_time
          : menuItem.preparation_time,
      is_available:
        is_available !== undefined ? is_available : menuItem.is_available,
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
      type: QueryTypes.SELECT,
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
      type: QueryTypes.SELECT,
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
      type: QueryTypes.SELECT,
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
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: {
        period,
        statusCounts: statusCounts.map((item) => ({
          status: item.status,
          count: item.count.toString(),
        })),
        totalRevenue: parseFloat(revenueResult[0]?.total_revenue || 0),
        averageOrderValue: parseFloat(avgOrderValue[0]?.avg_value || 0),
        outletStats: outletStats.map((item) => ({
          outlet_id: item.outlet_id,
          order_count: item.order_count.toString(),
          revenue: item.revenue.toString(),
          outlet: {
            id: item.outlet_id,
            name: item.outlet_name,
          },
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
      order_type,
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
        ...(search
          ? {
              where: {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } },
                ],
              },
              required: false,
            }
          : {}),
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
        { "$user.name$": { [Op.iLike]: `%${search}%` } },
        { "$user.email$": { [Op.iLike]: `%${search}%` } },
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
        "id",
        "order_number",
        "status",
        "order_type",
        "subtotal",
        "delivery_fee",
        "tax_amount",
        "discount_amount",
        "total_amount",
        "payment_status",
        "payment_method",
        "special_instructions",
        "estimated_delivery_time",
        "actual_delivery_time",
        "preparation_time",
        "delivery_time",
        "created_at",
        "updated_at",
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
        "id",
        "order_number",
        "status",
        "order_type",
        "subtotal",
        "delivery_fee",
        "tax_amount",
        "discount_amount",
        "total_amount",
        "payment_status",
        "payment_method",
        "special_instructions",
        "estimated_delivery_time",
        "actual_delivery_time",
        "preparation_time",
        "delivery_time",
        "created_at",
        "updated_at",
        "restaurant_notes",
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
          attributes: [
            "id",
            "street_address",
            "city",
            "state",
            "pincode",
            "landmark",
          ],
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
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "picked_up",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Update order status
    const restaurantNotes = notes
      ? typeof notes === "string"
        ? { text: notes }
        : notes
      : undefined;
    await order.updateStatus(
      status,
      restaurantNotes ? { restaurant: restaurantNotes } : {}
    );

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
      delivery_time,
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
    if (special_instructions !== undefined)
      updateData.special_instructions = special_instructions;
    if (estimated_delivery_time !== undefined)
      updateData.estimated_delivery_time = estimated_delivery_time;
    if (preparation_time !== undefined)
      updateData.preparation_time = preparation_time;
    if (delivery_time !== undefined) updateData.delivery_time = delivery_time;
    if (restaurant_notes !== undefined) {
      // Ensure restaurant_notes is an object before spreading
      const notesObj =
        typeof restaurant_notes === "string"
          ? { text: restaurant_notes }
          : restaurant_notes;
      updateData.restaurant_notes = {
        ...(order.restaurant_notes || {}),
        ...notesObj,
      };
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

// ==================== VENDOR MANAGEMENT ====================

// List all vendors with status filter
router.get("/vendors", adminAuth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { business_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await VendorProfile.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone", "is_active", "created_at"],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        vendors: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin vendors list error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
    });
  }
});

// Get vendor detail
router.get("/vendors/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await VendorProfile.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone", "is_active", "created_at"],
        },
      ],
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Get vendor's brands and outlets
    const brands = await Brand.findAll({
      where: { owner_id: vendor.user_id },
      attributes: ["id", "name", "slug", "is_active", "average_rating", "created_at"],
    });

    const outlets = await Outlet.findAll({
      where: { owner_id: vendor.user_id },
      attributes: ["id", "name", "city", "state", "is_active", "created_at"],
    });

    // Get vendor's order stats
    const outletIds = outlets.map((o) => o.id);
    const orderStats = outletIds.length > 0
      ? {
          totalOrders: await Order.count({
            where: { outlet_id: { [Op.in]: outletIds } },
          }),
          totalRevenue:
            (await Order.sum("total_amount", {
              where: {
                outlet_id: { [Op.in]: outletIds },
                status: "delivered",
              },
            })) || 0,
        }
      : { totalOrders: 0, totalRevenue: 0 };

    res.json({
      success: true,
      data: {
        vendor,
        brands,
        outlets,
        stats: orderStats,
      },
    });
  } catch (error) {
    console.error("Admin vendor detail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor details",
    });
  }
});

// Approve vendor
router.put("/vendors/:id/approve", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await VendorProfile.findByPk(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    await vendor.update({
      status: "approved",
      status_reason: null,
      approved_at: new Date(),
      approved_by: req.user.id,
    });

    res.json({
      success: true,
      message: "Vendor approved successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Admin vendor approve error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve vendor",
    });
  }
});

// Suspend vendor
router.put("/vendors/:id/suspend", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const vendor = await VendorProfile.findByPk(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    await vendor.update({
      status: "suspended",
      status_reason: reason || "Suspended by admin",
    });

    res.json({
      success: true,
      message: "Vendor suspended successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Admin vendor suspend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to suspend vendor",
    });
  }
});

// Reject vendor
router.put("/vendors/:id/reject", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const vendor = await VendorProfile.findByPk(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    await vendor.update({
      status: "rejected",
      status_reason: reason || "Application rejected",
    });

    res.json({
      success: true,
      message: "Vendor rejected",
      data: vendor,
    });
  } catch (error) {
    console.error("Admin vendor reject error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject vendor",
    });
  }
});

// Update vendor commission rate
router.put("/vendors/:id/commission", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { commission_rate } = req.body;

    if (commission_rate === undefined || commission_rate < 0 || commission_rate > 100) {
      return res.status(400).json({
        success: false,
        message: "Commission rate must be between 0 and 100",
      });
    }

    const vendor = await VendorProfile.findByPk(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    await vendor.update({ commission_rate: parseFloat(commission_rate) });

    res.json({
      success: true,
      message: "Commission rate updated",
      data: vendor,
    });
  } catch (error) {
    console.error("Admin vendor commission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update commission rate",
    });
  }
});

// Platform analytics
router.get("/platform-analytics", adminAuth, async (req, res) => {
  try {
    const [
      totalVendors,
      pendingVendors,
      approvedVendors,
      totalGMV,
    ] = await Promise.all([
      VendorProfile.count(),
      VendorProfile.count({ where: { status: "pending" } }),
      VendorProfile.count({ where: { status: "approved" } }),
      Order.sum("total_amount", { where: { status: "delivered" } }),
    ]);

    // Estimate commission earned (average commission * delivered order total)
    const avgCommission = await VendorProfile.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("commission_rate")), "avg_commission"],
      ],
      where: { status: "approved" },
      raw: true,
    });

    const commissionEarned =
      ((totalGMV || 0) * ((avgCommission?.avg_commission || 15) / 100));

    res.json({
      success: true,
      data: {
        totalVendors,
        pendingVendors,
        approvedVendors,
        suspendedVendors: await VendorProfile.count({ where: { status: "suspended" } }),
        totalGMV: totalGMV || 0,
        commissionEarned: Math.round(commissionEarned * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Platform analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch platform analytics",
    });
  }
});

// ==================== PLATFORM CATALOG ====================

// Get all brands across all vendors (read-only overview for admin)
router.get("/catalog/brands", adminAuth, async (req, res) => {
  try {
    const { search, vendor_id, status } = req.query;
    const where = {};
    if (vendor_id) where.owner_id = vendor_id;
    if (status === "active") where.is_active = true;
    else if (status === "inactive") where.is_active = false;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const brands = await Brand.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "owner", attributes: ["id", "name", "email"] },
        { model: Category, as: "categories", attributes: ["id", "name"], through: { attributes: [] } },
      ],
    });

    res.json({ success: true, data: brands });
  } catch (error) {
    console.error("Admin catalog brands error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch catalog brands" });
  }
});

// Get all outlets across all vendors
router.get("/catalog/outlets", adminAuth, async (req, res) => {
  try {
    const { search, vendor_id, city } = req.query;
    const where = {};
    if (vendor_id) where.owner_id = vendor_id;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const outlets = await Outlet.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "owner", attributes: ["id", "name", "email"] },
        { model: Brand, as: "Brands", attributes: ["id", "name", "slug"], through: { attributes: [] } },
      ],
    });

    res.json({ success: true, data: outlets });
  } catch (error) {
    console.error("Admin catalog outlets error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch catalog outlets" });
  }
});

// Get all menu items across all vendors
router.get("/catalog/menu-items", adminAuth, async (req, res) => {
  try {
    const { search, brand_id } = req.query;
    const where = {};
    if (brand_id) where.brand_id = brand_id;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const items = await MenuItem.findAll({
      where,
      limit: 100,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Brand, as: "parentBrand",
          attributes: ["id", "name", "owner_id"],
          include: [{ model: User, as: "owner", attributes: ["id", "name"] }],
        },
        { model: Category, as: "categoryInfo", attributes: ["id", "name"] },
      ],
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Admin catalog menu items error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch catalog menu items" });
  }
});

// Admin override: toggle brand active/inactive
router.put("/catalog/brands/:id/toggle", adminAuth, async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    await brand.update({ is_active: !brand.is_active });
    res.json({ success: true, message: `Brand ${brand.is_active ? "activated" : "deactivated"}`, data: brand });
  } catch (error) {
    console.error("Admin toggle brand error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle brand" });
  }
});

// Admin override: toggle outlet active/inactive
router.put("/catalog/outlets/:id/toggle", adminAuth, async (req, res) => {
  try {
    const outlet = await Outlet.findByPk(req.params.id);
    if (!outlet) return res.status(404).json({ success: false, message: "Outlet not found" });

    await outlet.update({ is_active: !outlet.is_active });
    res.json({ success: true, message: `Outlet ${outlet.is_active ? "activated" : "deactivated"}`, data: outlet });
  } catch (error) {
    console.error("Admin toggle outlet error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle outlet" });
  }
});

// ==================== ANALYTICS ====================

// Revenue analytics — breakdown by vendor
router.get("/analytics/revenue", adminAuth, async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const since = new Date();
    if (period === "today") since.setHours(0, 0, 0, 0);
    else if (period === "week") since.setDate(since.getDate() - 7);
    else if (period === "month") since.setMonth(since.getMonth() - 1);
    else since.setFullYear(since.getFullYear() - 1);

    // Revenue by vendor (via outlet owner_id)
    const vendorRevenue = await sequelize.query(`
      SELECT u.id as vendor_id, u.name as vendor_name, vp.business_name,
             COUNT(o.id) as order_count,
             COALESCE(SUM(o.total_amount), 0) as revenue,
             COALESCE(vp.commission_rate, 15) as commission_rate,
             COALESCE(SUM(o.total_amount) * vp.commission_rate / 100, 0) as commission
      FROM orders o
      JOIN outlets ot ON o.outlet_id = ot.id
      JOIN users u ON ot.owner_id = u.id
      LEFT JOIN vendor_profiles vp ON vp.user_id = u.id
      WHERE o.status = 'delivered' AND o.created_at >= :since
      GROUP BY u.id, u.name, vp.business_name, vp.commission_rate
      ORDER BY revenue DESC
    `, { replacements: { since }, type: QueryTypes.SELECT });

    // Revenue by city
    const cityRevenue = await sequelize.query(`
      SELECT ot.city, COUNT(o.id) as order_count,
             COALESCE(SUM(o.total_amount), 0) as revenue
      FROM orders o
      JOIN outlets ot ON o.outlet_id = ot.id
      WHERE o.status = 'delivered' AND o.created_at >= :since AND ot.city IS NOT NULL
      GROUP BY ot.city ORDER BY revenue DESC LIMIT 10
    `, { replacements: { since }, type: QueryTypes.SELECT });

    const totalRevenue = vendorRevenue.reduce((sum, v) => sum + parseFloat(v.revenue || 0), 0);
    const totalCommission = vendorRevenue.reduce((sum, v) => sum + parseFloat(v.commission || 0), 0);

    res.json({
      success: true,
      data: { period, totalRevenue, totalCommission, vendorRevenue, cityRevenue },
    });
  } catch (error) {
    console.error("Admin analytics revenue error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch revenue analytics" });
  }
});

// Order analytics — trends and breakdown
router.get("/analytics/orders", adminAuth, async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const since = new Date();
    if (period === "today") since.setHours(0, 0, 0, 0);
    else if (period === "week") since.setDate(since.getDate() - 7);
    else if (period === "month") since.setMonth(since.getMonth() - 1);
    else since.setFullYear(since.getFullYear() - 1);

    const statusBreakdown = await Order.findAll({
      where: { created_at: { [Op.gte]: since } },
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // Daily order volume
    const dailyVolume = await sequelize.query(`
      SELECT DATE(created_at) as date, COUNT(*) as orders,
             COALESCE(SUM(total_amount), 0) as revenue
      FROM orders WHERE created_at >= :since
      GROUP BY DATE(created_at) ORDER BY date
    `, { replacements: { since }, type: QueryTypes.SELECT });

    // Peak hours (by hour of day)
    const peakHours = await sequelize.query(`
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as orders
      FROM orders WHERE created_at >= :since
      GROUP BY hour ORDER BY orders DESC LIMIT 5
    `, { replacements: { since }, type: QueryTypes.SELECT });

    const totalOrders = statusBreakdown.reduce((sum, s) => sum + parseInt(s.count), 0);
    const avgOrderValue = totalOrders > 0
      ? (await Order.sum("total_amount", { where: { created_at: { [Op.gte]: since } } })) / totalOrders
      : 0;

    res.json({
      success: true,
      data: { period, statusBreakdown, dailyVolume, peakHours, totalOrders, avgOrderValue: Math.round(avgOrderValue * 100) / 100 },
    });
  } catch (error) {
    console.error("Admin analytics orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order analytics" });
  }
});

// Top performers — best vendors, brands, items
router.get("/analytics/top-performers", adminAuth, async (req, res) => {
  try {
    // Top vendors by revenue
    const topVendors = await sequelize.query(`
      SELECT u.id, u.name, vp.business_name,
             COUNT(o.id) as order_count,
             COALESCE(SUM(o.total_amount), 0) as revenue
      FROM orders o
      JOIN outlets ot ON o.outlet_id = ot.id
      JOIN users u ON ot.owner_id = u.id
      LEFT JOIN vendor_profiles vp ON vp.user_id = u.id
      WHERE o.status = 'delivered'
      GROUP BY u.id, u.name, vp.business_name
      ORDER BY revenue DESC LIMIT 10
    `, { type: QueryTypes.SELECT });

    // Top brands by order count
    const topBrands = await sequelize.query(`
      SELECT b.id, b.name, b.cuisine_type, b.average_rating,
             COUNT(DISTINCT oi.order_id) as order_count,
             COALESCE(SUM(oi.total_price), 0) as revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN brands b ON mi.brand_id = b.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered'
      GROUP BY b.id, b.name, b.cuisine_type, b.average_rating
      ORDER BY order_count DESC LIMIT 10
    `, { type: QueryTypes.SELECT });

    // Top selling items
    const topItems = await sequelize.query(`
      SELECT mi.id, mi.name, mi.base_price, b.name as brand_name,
             SUM(oi.quantity) as total_sold,
             COALESCE(SUM(oi.total_price), 0) as revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN brands b ON mi.brand_id = b.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered'
      GROUP BY mi.id, mi.name, mi.base_price, b.name
      ORDER BY total_sold DESC LIMIT 10
    `, { type: QueryTypes.SELECT });

    res.json({
      success: true,
      data: { topVendors, topBrands, topItems },
    });
  } catch (error) {
    console.error("Admin analytics top performers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch top performers" });
  }
});

module.exports = router;
