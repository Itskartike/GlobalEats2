const User = require("./User");
const Restaurant = require("./Restaurant");
const MenuItem = require("./MenuItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Address = require("./Address");
const Brand = require("./Brand");
const Outlet = require("./Outlet");
const Category = require("./Category");
const OutletMenuItem = require("./OutletMenuItem");
const BrandCategory = require("./BrandCategory");
const OutletBrand = require("./OutletBrand");
const UserSession = require("./UserSession");

// NOTE: All associations have been moved to associations.js to create a single source of truth.
// This file should only be used for exporting model definitions.

module.exports = {
  User,
  Restaurant,
  MenuItem,
  Order,
  OrderItem,
  Address,
  Brand,
  Outlet,
  Category,
  OutletMenuItem,
  BrandCategory,
  OutletBrand,
  UserSession,
};
