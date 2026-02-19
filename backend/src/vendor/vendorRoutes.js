const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const {
  User,
  VendorProfile,
  Brand,
  Outlet,
  OutletBrand,
  Category,
  BrandCategory,
  MenuItem,
  OutletMenuItem,
  Order,
  OrderItem,
} = require("../models/associations");
const { sequelize } = require("../database/config/database");
const { vendorAuth, vendorAuthPending, scopeToVendor } = require("./vendorAuth");

const router = express.Router();

// ==================== AUTH ====================

// Vendor Registration
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      business_name,
      business_type,
      description,
      gst_number,
      fssai_license,
      pan_number,
      bank_details,
    } = req.body;

    // Validation — required fields
    if (!name || !email || !phone || !password || !business_name) {
      return res.status(400).json({
        success: false,
        message: "Required: name, email, phone, password, business_name",
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate phone (10-digit Indian mobile)
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian phone number",
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    // Validate optional fields format
    if (gst_number && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gst_number.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid GST number format (e.g. 22AAAAA0000A1Z5)",
      });
    }

    if (fssai_license && !/^\d{14}$/.test(fssai_license)) {
      return res.status(400).json({
        success: false,
        message: "FSSAI license must be a 14-digit number",
      });
    }

    if (pan_number && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(pan_number.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format (e.g. ABCDE1234F)",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user with vendor role
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: "vendor",
      is_active: true,
    });

    // Create vendor profile
    const vendorProfile = await VendorProfile.create({
      user_id: user.id,
      business_name,
      business_type: business_type || "restaurant",
      description: description || null,
      gst_number: gst_number || null,
      fssai_license: fssai_license || null,
      pan_number: pan_number || null,
      bank_details: bank_details || null,
      phone: phone,
      email: email,
      status: "pending",
    });

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Vendor registration successful. Awaiting admin approval.",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        vendorProfile: {
          id: vendorProfile.id,
          business_name: vendorProfile.business_name,
          business_type: vendorProfile.business_type,
          status: vendorProfile.status,
        },
      },
    });
  } catch (error) {
    console.error("Vendor registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      ...(process.env.NODE_ENV !== "production" && { error: error.message }),
    });
  }
});

// Vendor Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: VendorProfile, as: "vendorProfile" }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Not a vendor account. Use the appropriate login.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

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
          name: user.name,
          email: user.email,
          role: user.role,
        },
        vendorProfile: user.vendorProfile
          ? {
              id: user.vendorProfile.id,
              business_name: user.vendorProfile.business_name,
              business_type: user.vendorProfile.business_type,
              status: user.vendorProfile.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// ==================== PROFILE ====================

// Get vendor profile (allows pending)
router.get("/profile", vendorAuthPending, async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    res.json({
      success: true,
      data: vendorProfile,
    });
  } catch (error) {
    console.error("Get vendor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

// Update vendor profile (allows pending)
router.put("/profile", vendorAuthPending, async (req, res) => {
  try {
    const {
      business_name,
      business_type,
      description,
      logo_url,
      banner_url,
      phone,
      email,
      website,
      gst_number,
      fssai_license,
      pan_number,
      bank_details,
      documents,
      settings,
    } = req.body;

    const vendorProfile = await VendorProfile.findOne({
      where: { user_id: req.user.id },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    await vendorProfile.update({
      ...(business_name !== undefined && { business_name }),
      ...(business_type !== undefined && { business_type }),
      ...(description !== undefined && { description }),
      ...(logo_url !== undefined && { logo_url }),
      ...(banner_url !== undefined && { banner_url }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(website !== undefined && { website }),
      ...(gst_number !== undefined && { gst_number }),
      ...(fssai_license !== undefined && { fssai_license }),
      ...(pan_number !== undefined && { pan_number }),
      ...(bank_details !== undefined && { bank_details }),
      ...(documents !== undefined && { documents }),
      ...(settings !== undefined && { settings }),
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: vendorProfile,
    });
  } catch (error) {
    console.error("Update vendor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

// ==================== DASHBOARD ====================

router.get("/dashboard", vendorAuth, async (req, res) => {
  try {
    const vendorScope = scopeToVendor(req);

    // Get vendor's brand/outlet IDs
    const vendorBrands = await Brand.findAll({
      where: vendorScope,
      attributes: ["id"],
    });
    const brandIds = vendorBrands.map((b) => b.id);

    const vendorOutlets = await Outlet.findAll({
      where: vendorScope,
      attributes: ["id"],
    });
    const outletIds = vendorOutlets.map((o) => o.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBrands,
      totalOutlets,
      totalMenuItems,
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      Brand.count({ where: vendorScope }),
      Outlet.count({ where: vendorScope }),
      MenuItem.count({ where: { brand_id: { [Op.in]: brandIds } } }),
      Order.count({
        where: { outlet_id: { [Op.in]: outletIds } },
      }),
      Order.count({
        where: {
          outlet_id: { [Op.in]: outletIds },
          created_at: { [Op.gte]: today },
        },
      }),
      Order.sum("total_amount", {
        where: {
          outlet_id: { [Op.in]: outletIds },
          status: "delivered",
        },
      }),
      Order.sum("total_amount", {
        where: {
          outlet_id: { [Op.in]: outletIds },
          status: "delivered",
          created_at: { [Op.gte]: today },
        },
      }),
    ]);

    // Recent orders
    const recentOrders = await Order.findAll({
      where: { outlet_id: { [Op.in]: outletIds } },
      limit: 10,
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "order_number",
        "status",
        "total_amount",
        "created_at",
      ],
      include: [
        { model: User, as: "user", attributes: ["name", "email"] },
        { model: Outlet, as: "outlet", attributes: ["name"] },
      ],
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalBrands,
          totalOutlets,
          totalMenuItems,
          totalOrders,
          todayOrders,
          totalRevenue: totalRevenue || 0,
          todayRevenue: todayRevenue || 0,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Vendor dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
});

// ==================== BRAND MANAGEMENT ====================

// List own brands
router.get("/brands", vendorAuth, async (req, res) => {
  try {
    const brands = await Brand.findAll({
      where: scopeToVendor(req),
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

    res.json({ success: true, data: brands });
  } catch (error) {
    console.error("Vendor brands fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
});

// Create brand
router.post("/brands", vendorAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      logo_url,
      banner_url,
      cuisine_type,
      delivery_time,
      minimum_order_amount,
      delivery_fee,
      is_active,
      categories,
    } = req.body;

    if (!name || !description || !cuisine_type) {
      return res.status(400).json({
        success: false,
        message: "Required: name, description, cuisine_type",
      });
    }

    // Generate unique slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const existing = await Brand.findOne({ where: { slug } });
      if (!existing) break;
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    const brand = await Brand.create({
      name,
      slug,
      description,
      logo_url,
      banner_url,
      cuisine_type,
      estimated_delivery_time: parseInt(delivery_time) || 30,
      minimum_order_amount: minimum_order_amount || 0,
      delivery_fee: delivery_fee || 0,
      is_active: is_active !== false,
      owner_id: req.user.id,
    });

    if (categories && categories.length > 0) {
      await brand.setCategories(categories);
    }

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
    console.error("Vendor brand creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create brand",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// Update own brand
router.put("/brands/:id", vendorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findOne({
      where: { id, ...scopeToVendor(req) },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found or access denied",
      });
    }

    const {
      name,
      description,
      logo_url,
      banner_url,
      cuisine_type,
      delivery_time,
      minimum_order_amount,
      delivery_fee,
      is_active,
      categories,
    } = req.body;

    // Regenerate slug if name changed
    let slug = brand.slug;
    if (name && name !== brand.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      let counter = 1;
      let originalSlug = slug;
      while (true) {
        const existing = await Brand.findOne({
          where: { slug, id: { [Op.ne]: id } },
        });
        if (!existing) break;
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    await brand.update({
      ...(name !== undefined && { name }),
      slug,
      ...(description !== undefined && { description }),
      ...(logo_url !== undefined && { logo_url }),
      ...(banner_url !== undefined && { banner_url }),
      ...(cuisine_type !== undefined && { cuisine_type }),
      ...(delivery_time !== undefined && {
        estimated_delivery_time: parseInt(delivery_time),
      }),
      ...(minimum_order_amount !== undefined && { minimum_order_amount }),
      ...(delivery_fee !== undefined && { delivery_fee }),
      ...(is_active !== undefined && { is_active }),
    });

    if (categories) {
      await brand.setCategories(categories);
    }

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
    console.error("Vendor brand update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update brand",
    });
  }
});

// Delete own brand (soft-delete via is_active)
router.delete("/brands/:id", vendorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findOne({
      where: { id, ...scopeToVendor(req) },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found or access denied",
      });
    }

    // Check for outlet associations
    const outletsCount = await OutletBrand.count({ where: { brand_id: id } });
    if (outletsCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete brand associated with outlets. Remove associations first.",
      });
    }

    const menuItemsCount = await MenuItem.count({ where: { brand_id: id } });
    if (menuItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete brand with menu items. Delete items first.",
      });
    }

    await brand.destroy();

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Vendor brand deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete brand",
    });
  }
});

// ==================== OUTLET MANAGEMENT ====================

// List own outlets
router.get("/outlets", vendorAuth, async (req, res) => {
  try {
    const outlets = await Outlet.findAll({
      where: scopeToVendor(req),
      include: [
        {
          model: Brand,
          as: "Brands",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: outlets });
  } catch (error) {
    console.error("Vendor outlets fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch outlets",
    });
  }
});

// Create outlet
router.post("/outlets", vendorAuth, async (req, res) => {
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
      delivery_radius,
      is_active,
      operating_hours,
    } = req.body;

    if (!name || !address || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "Required: name, address, city, state",
      });
    }

    const outlet = await Outlet.create({
      name,
      address,
      city,
      state,
      postal_code: postal_code || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone: phone || null,
      email: email || null,
      delivery_radius: delivery_radius ? parseFloat(delivery_radius) : 5.0,
      is_active: is_active !== false,
      operating_hours: operating_hours || undefined,
      owner_id: req.user.id,
    });

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
    console.error("Vendor outlet creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create outlet",
      ...(process.env.NODE_ENV !== "production" && { error: error?.message }),
    });
  }
});

// Update own outlet
router.put("/outlets/:id", vendorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const outlet = await Outlet.findOne({
      where: { id, ...scopeToVendor(req) },
    });

    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: "Outlet not found or access denied",
      });
    }

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
      delivery_radius,
      is_active,
      operating_hours,
    } = req.body;

    await outlet.update({
      ...(name !== undefined && { name }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(postal_code !== undefined && { postal_code }),
      ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
      ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(delivery_radius !== undefined && {
        delivery_radius: parseFloat(delivery_radius),
      }),
      ...(is_active !== undefined && { is_active }),
      ...(operating_hours !== undefined && { operating_hours }),
    });

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
    console.error("Vendor outlet update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update outlet",
    });
  }
});

// Deactivate own outlet
router.delete("/outlets/:id", vendorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const outlet = await Outlet.findOne({
      where: { id, ...scopeToVendor(req) },
    });

    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: "Outlet not found or access denied",
      });
    }

    // Check for active orders
    const activeOrders = await Order.count({
      where: {
        outlet_id: id,
        status: { [Op.notIn]: ["delivered", "cancelled", "refunded"] },
      },
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete outlet with ${activeOrders} active order(s).`,
      });
    }

    await outlet.update({ is_active: false });

    res.json({
      success: true,
      message: "Outlet deactivated successfully",
    });
  } catch (error) {
    console.error("Vendor outlet deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate outlet",
    });
  }
});

// List all categories (for dropdown)
router.get("/categories", vendorAuth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Vendor categories fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
});

// ==================== MENU MANAGEMENT ====================

// List menu items for own brands
router.get("/menu-items", vendorAuth, async (req, res) => {
  try {
    const { brand_id, category_id, search } = req.query;

    // Get vendor's brand IDs
    const vendorBrands = await Brand.findAll({
      where: scopeToVendor(req),
      attributes: ["id"],
    });
    const brandIds = vendorBrands.map((b) => b.id);

    if (brandIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const where = { brand_id: { [Op.in]: brandIds } };

    if (brand_id) {
      if (!brandIds.includes(brand_id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this brand",
        });
      }
      where.brand_id = brand_id;
    }

    if (category_id) where.category_id = category_id;

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const menuItems = await MenuItem.findAll({
      where,
      include: [
        { model: Brand, as: "parentBrand", attributes: ["id", "name", "slug"] },
        {
          model: Category,
          as: "categoryInfo",
          attributes: ["id", "name"],
        },
      ],
      order: [["sort_order", "ASC"], ["name", "ASC"]],
    });

    res.json({ success: true, data: menuItems });
  } catch (error) {
    console.error("Vendor menu items fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
});

// Create menu item
router.post("/menu-items", vendorAuth, async (req, res) => {
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

    if (!brand_id || !name || !base_price || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Required: brand_id, category_id, name, base_price",
      });
    }

    // Verify brand belongs to vendor
    const brand = await Brand.findOne({
      where: { id: brand_id, ...scopeToVendor(req) },
    });

    if (!brand) {
      return res.status(403).json({
        success: false,
        message: "Brand not found or access denied",
      });
    }

    const menuItem = await MenuItem.create({
      brand_id,
      category_id: category_id || null,
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
      is_available: is_available !== false,
      sort_order: sort_order || 0,
    });

    const createdItem = await MenuItem.findByPk(menuItem.id, {
      include: [
        { model: Brand, as: "parentBrand", attributes: ["id", "name"] },
        { model: Category, as: "categoryInfo", attributes: ["id", "name"] },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: createdItem,
    });
  } catch (error) {
    console.error("Vendor menu item creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
    });
  }
});

// Update own menu item
router.put("/menu-items/:id", vendorAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find menu item and verify it belongs to vendor's brand
    const menuItem = await MenuItem.findByPk(id, {
      include: [{ model: Brand, as: "parentBrand", attributes: ["id", "owner_id"] }],
    });

    if (!menuItem || menuItem.parentBrand?.owner_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found or access denied",
      });
    }

    const {
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

    await menuItem.update({
      ...(category_id !== undefined && { category_id }),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(image_url !== undefined && { image_url }),
      ...(base_price !== undefined && { base_price: parseFloat(base_price) }),
      ...(is_vegetarian !== undefined && { is_vegetarian }),
      ...(is_vegan !== undefined && { is_vegan }),
      ...(is_gluten_free !== undefined && { is_gluten_free }),
      ...(spice_level !== undefined && { spice_level }),
      ...(calories !== undefined && { calories }),
      ...(preparation_time !== undefined && { preparation_time }),
      ...(is_available !== undefined && { is_available }),
      ...(sort_order !== undefined && { sort_order }),
    });

    const updatedItem = await MenuItem.findByPk(id, {
      include: [
        { model: Brand, as: "parentBrand", attributes: ["id", "name"] },
        { model: Category, as: "categoryInfo", attributes: ["id", "name"] },
      ],
    });

    res.json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Vendor menu item update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
    });
  }
});

// Delete own menu item
router.delete("/menu-items/:id", vendorAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id, {
      include: [{ model: Brand, as: "parentBrand", attributes: ["id", "owner_id"] }],
    });

    if (!menuItem || menuItem.parentBrand?.owner_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found or access denied",
      });
    }

    await menuItem.destroy();

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Vendor menu item deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
    });
  }
});

// Get categories (read-only)
router.get("/categories", vendorAuth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      attributes: ["id", "name", "description", "image_url"],
      order: [["sort_order", "ASC"], ["name", "ASC"]],
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Vendor categories fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// ==================== OUTLET-BRAND LINKS ====================

// Get own outlet-brand associations
router.get("/outlet-brands", vendorAuth, async (req, res) => {
  try {
    const outlets = await Outlet.findAll({
      where: scopeToVendor(req),
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
            ],
          },
          attributes: ["id", "name", "slug", "logo_url", "cuisine_type"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json({ success: true, data: outlets });
  } catch (error) {
    console.error("Vendor outlet-brands fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch outlet-brand associations",
    });
  }
});

// Link brand to own outlet
router.post("/outlets/:outletId/brands", vendorAuth, async (req, res) => {
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

    // Verify outlet belongs to vendor
    const outlet = await Outlet.findOne({
      where: { id: outletId, ...scopeToVendor(req) },
    });
    if (!outlet) {
      return res.status(404).json({
        success: false,
        message: "Outlet not found or access denied",
      });
    }

    // Verify brand belongs to vendor
    const brand = await Brand.findOne({
      where: { id: brand_id, ...scopeToVendor(req) },
    });
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found or access denied",
      });
    }

    // Check for existing association
    const existing = await OutletBrand.findOne({
      where: { outlet_id: outletId, brand_id },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Brand already associated with this outlet",
      });
    }

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
      message: "Brand linked to outlet successfully",
    });
  } catch (error) {
    console.error("Vendor outlet-brand link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to link brand to outlet",
    });
  }
});

// Unlink brand from own outlet
router.delete(
  "/outlets/:outletId/brands/:brandId",
  vendorAuth,
  async (req, res) => {
    try {
      const { outletId, brandId } = req.params;

      // Verify outlet belongs to vendor
      const outlet = await Outlet.findOne({
        where: { id: outletId, ...scopeToVendor(req) },
      });
      if (!outlet) {
        return res.status(404).json({
          success: false,
          message: "Outlet not found or access denied",
        });
      }

      const association = await OutletBrand.findOne({
        where: { outlet_id: outletId, brand_id: brandId },
      });
      if (!association) {
        return res.status(404).json({
          success: false,
          message: "Association not found",
        });
      }

      await association.destroy();

      res.json({
        success: true,
        message: "Brand unlinked from outlet successfully",
      });
    } catch (error) {
      console.error("Vendor outlet-brand unlink error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unlink brand from outlet",
      });
    }
  }
);

// ==================== ORDER MANAGEMENT ====================

// List orders for own outlets
router.get("/orders", vendorAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const vendorOutlets = await Outlet.findAll({
      where: scopeToVendor(req),
      attributes: ["id"],
    });
    const outletIds = vendorOutlets.map((o) => o.id);

    if (outletIds.length === 0) {
      return res.json({
        success: true,
        data: { orders: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0 } },
      });
    }

    const where = { outlet_id: { [Op.in]: outletIds } };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["name", "email", "phone"] },
        { model: Outlet, as: "outlet", attributes: ["name"] },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            { model: MenuItem, as: "menuItem", attributes: ["name", "base_price"] },
          ],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Vendor orders fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

// Get order detail (own outlet only)
router.get("/orders/:id", vendorAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const vendorOutlets = await Outlet.findAll({
      where: scopeToVendor(req),
      attributes: ["id"],
    });
    const outletIds = vendorOutlets.map((o) => o.id);

    const order = await Order.findOne({
      where: { id, outlet_id: { [Op.in]: outletIds } },
      include: [
        { model: User, as: "user", attributes: ["name", "email", "phone"] },
        { model: Outlet, as: "outlet", attributes: ["name", "address", "city"] },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            { model: MenuItem, as: "menuItem", attributes: ["name", "base_price", "image_url"] },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Vendor order detail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
});

// Update order status (limited transitions)
router.put("/orders/:id/status", vendorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Allowed vendor transitions
    const allowedStatuses = ["confirmed", "preparing", "ready_for_pickup"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const vendorOutlets = await Outlet.findAll({
      where: scopeToVendor(req),
      attributes: ["id"],
    });
    const outletIds = vendorOutlets.map((o) => o.id);

    const order = await Order.findOne({
      where: { id, outlet_id: { [Op.in]: outletIds } },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
    }

    // Validate status transition
    const validTransitions = {
      pending: ["confirmed"],
      confirmed: ["preparing"],
      preparing: ["ready_for_pickup"],
    };

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    await order.update({ status });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { id: order.id, status: order.status },
    });
  } catch (error) {
    console.error("Vendor order status update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
});

module.exports = router;
