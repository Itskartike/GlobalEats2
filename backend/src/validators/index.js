const Joi = require("joi");

// User validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string()
    .valid("customer", "restaurant_owner", "delivery_agent")
    .default("customer"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  profileImage: Joi.string().uri().optional(),
});

// Restaurant validation schemas
const createRestaurantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  cuisines: Joi.array().items(Joi.string()).min(1).required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  email: Joi.string().email().optional(),
  addressLine1: Joi.string().max(200).required(),
  addressLine2: Joi.string().max(200).optional(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  postalCode: Joi.string().max(20).required(),
  country: Joi.string().max(100).default("India"),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  openingTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .optional(),
  closingTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .optional(),
  deliveryTime: Joi.number().min(5).max(120).default(30),
  minimumOrder: Joi.number().min(0).default(0),
  deliveryFee: Joi.number().min(0).default(0),
});

// Menu Item validation schemas
const createMenuItemSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().max(50).required(),
  image: Joi.string().uri().optional(),
  isVegetarian: Joi.boolean().default(false),
  isVegan: Joi.boolean().default(false),
  isGlutenFree: Joi.boolean().default(false),
  allergens: Joi.array().items(Joi.string()).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  preparationTime: Joi.number().min(1).max(120).default(15),
  isAvailable: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false),
  discountPercentage: Joi.number().min(0).max(100).default(0),
  tags: Joi.array().items(Joi.string()).optional(),
});

// Order validation schemas
const createOrderSchema = Joi.object({
  restaurantId: Joi.string().guid({ version: "uuidv4" }).required(),
  items: Joi.array()
    .items(
      Joi.object({
        menuItemId: Joi.string().guid({ version: "uuidv4" }).required(),
        quantity: Joi.number().min(1).required(),
        specialInstructions: Joi.string().max(200).optional(),
      })
    )
    .min(1)
    .required(),
  deliveryAddressId: Joi.string().guid({ version: "uuidv4" }).required(),
  paymentMethod: Joi.string()
    .valid("cash_on_delivery", "card", "upi", "wallet")
    .required(),
  specialInstructions: Joi.string().max(500).optional(),
  couponCode: Joi.string().max(20).optional(),
});

// Address validation schemas
const createAddressSchema = Joi.object({
  label: Joi.string().valid("home", "work", "other").required(),
  addressLine1: Joi.string().max(200).required(),
  addressLine2: Joi.string().max(200).optional(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  postalCode: Joi.string().max(20).required(),
  country: Joi.string().max(100).default("India"),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  isDefault: Joi.boolean().default(false),
  deliveryInstructions: Joi.string().max(500).optional(),
});

// Common validation schemas
const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
});

const searchSchema = Joi.object({
  query: Joi.string().min(1).max(100).optional(),
  cuisine: Joi.string().max(50).optional(),
  category: Joi.string().max(50).optional(),
  priceMin: Joi.number().min(0).optional(),
  priceMax: Joi.number().min(0).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  isVegetarian: Joi.boolean().optional(),
  isVegan: Joi.boolean().optional(),
  isGlutenFree: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid("name", "price", "rating", "deliveryTime", "popularity")
    .default("name"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
});

module.exports = {
  // User schemas
  registerSchema,
  loginSchema,
  updateProfileSchema,

  // Restaurant schemas
  createRestaurantSchema,

  // Menu Item schemas
  createMenuItemSchema,

  // Order schemas
  createOrderSchema,

  // Address schemas
  createAddressSchema,

  // Common schemas
  paginationSchema,
  searchSchema,
};
