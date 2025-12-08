// Updated Model associations for Phase 3A: Multi-Brand Outlets System
const Brand = require("./Brand");
const Outlet = require("./Outlet");
const OutletBrand = require("./OutletBrand");
const Category = require("./Category");
const MenuItem = require("./MenuItem");
const OutletMenuItem = require("./OutletMenuItem");
const BrandCategory = require("./BrandCategory");
const User = require("./User");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Address = require("./Address");

// ========================================
// PHASE 3A: MULTI-BRAND OUTLET ASSOCIATIONS
// ========================================

// Outlet ↔ Brand (Many-to-Many via OutletBrand)
Outlet.belongsToMany(Brand, {
  through: OutletBrand,
  foreignKey: "outlet_id",
  otherKey: "brand_id",
  as: "brands",
});

Brand.belongsToMany(Outlet, {
  through: OutletBrand,
  foreignKey: "brand_id",
  otherKey: "outlet_id", 
  as: "outlets",
});

// Direct associations with junction table
Outlet.hasMany(OutletBrand, { foreignKey: "outlet_id", as: "outletBrands" });
Brand.hasMany(OutletBrand, { foreignKey: "brand_id", as: "brandOutlets" });
OutletBrand.belongsTo(Outlet, { foreignKey: "outlet_id", as: "outlet" });
OutletBrand.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });

// ========================================
// EXISTING ASSOCIATIONS (Updated)
// ========================================

// Brand associations
Brand.hasMany(MenuItem, { foreignKey: "brand_id", as: "menuItems" });
Brand.belongsToMany(Category, {
  through: BrandCategory,
  foreignKey: "brand_id",
  otherKey: "category_id",
  as: "categories",
});

// Outlet associations  
Outlet.hasMany(OutletMenuItem, {
  foreignKey: "outlet_id",
  as: "outletMenuItems",
});
Outlet.belongsToMany(MenuItem, {
  through: OutletMenuItem,
  foreignKey: "outlet_id",
  otherKey: "menu_item_id",
  as: "availableMenuItems",
});

// Category associations
Category.hasMany(MenuItem, { foreignKey: "category_id", as: "menuItems" });
Category.belongsToMany(Brand, {
  through: BrandCategory,
  foreignKey: "category_id",
  otherKey: "brand_id",
  as: "brands",
});

// MenuItem associations
MenuItem.belongsTo(Brand, { foreignKey: "brand_id", as: "parentBrand" });
MenuItem.belongsTo(Category, {
  foreignKey: "category_id",
  as: "categoryInfo",
});
MenuItem.belongsToMany(Outlet, {
  through: OutletMenuItem,
  foreignKey: "menu_item_id",
  otherKey: "outlet_id",
  as: "availableOutlets",
});

// OutletMenuItem associations (Enhanced with pricing)
OutletMenuItem.belongsTo(Outlet, { foreignKey: "outlet_id", as: "outlet" });
OutletMenuItem.belongsTo(MenuItem, {
  foreignKey: "menu_item_id",
  as: "menuItem",
});

// BrandCategory associations
BrandCategory.belongsTo(Brand, { foreignKey: "brand_id", as: "brandOwner" });
BrandCategory.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// ========================================
// ORDER ASSOCIATIONS (Enhanced with outlet assignment)
// ========================================

// Orders now include outlet and brand assignment
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
Order.belongsTo(Outlet, { foreignKey: "outlet_id", as: "assignedOutlet" });
Order.belongsTo(Brand, { foreignKey: "brand_id", as: "primaryBrand" });
Order.belongsTo(Address, { foreignKey: "address_id", as: "deliveryAddress" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });

// Reverse associations
Outlet.hasMany(Order, { foreignKey: "outlet_id", as: "orders" });
Brand.hasMany(Order, { foreignKey: "brand_id", as: "orders" });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(MenuItem, {
  foreignKey: "menu_item_id",
  as: "menuItem",
});

// User associations
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });

// Address associations
Address.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  Brand,
  Outlet,
  OutletBrand,
  Category,
  MenuItem,
  OutletMenuItem,
  BrandCategory,
  User,
  Order,
  OrderItem,
  Address,
};
