// Model associations for Phase 2: Brand-Outlet System
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
const Payment = require("./Payment");

// Brand associations
// Removed old direct outlet relationship: Brand.hasMany(Outlet, { foreignKey: "brand_id", as: "outlets" });
Brand.hasMany(MenuItem, { foreignKey: "brand_id", as: "menuItems" });
Brand.belongsToMany(Category, {
  through: BrandCategory,
  foreignKey: "brand_id",
  otherKey: "category_id",
  as: "categories",
});

// Brand-Outlet many-to-many relationship
Brand.belongsToMany(Outlet, {
  through: OutletBrand,
  foreignKey: "brand_id",
  otherKey: "outlet_id",
  as: "Outlets",
});

// Outlet associations
// Removed old direct brand relationship: Outlet.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });
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

// Outlet-Brand many-to-many relationship (reverse)
Outlet.belongsToMany(Brand, {
  through: OutletBrand,
  foreignKey: "outlet_id",
  otherKey: "brand_id",
  as: "Brands",
});

// OutletBrand associations
OutletBrand.belongsTo(Outlet, { foreignKey: "outlet_id", as: "Outlet" });
OutletBrand.belongsTo(Brand, { foreignKey: "brand_id", as: "Brand" });

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

// OutletMenuItem associations
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

// Order associations
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
Order.belongsTo(Outlet, { foreignKey: "outlet_id", as: "outlet" });
Order.belongsTo(Address, { foreignKey: "address_id", as: "address" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });
Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(MenuItem, {
  foreignKey: "menu_item_id",
  as: "menuItem",
});

// User associations
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });
User.hasMany(Payment, { foreignKey: "user_id", as: "payments" });

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
  Payment,
};
