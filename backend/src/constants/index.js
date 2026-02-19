// Application Constants
module.exports = {
  // User Roles
  USER_ROLES: {
    CUSTOMER: "customer",
    VENDOR: "vendor",
    DELIVERY_AGENT: "delivery_agent",
    ADMIN: "admin",
  },

  // Vendor Status
  VENDOR_STATUS: {
    PENDING: "pending",
    APPROVED: "approved",
    SUSPENDED: "suspended",
    REJECTED: "rejected",
  },

  // Business Types
  BUSINESS_TYPES: {
    RESTAURANT: "restaurant",
    CLOUD_KITCHEN: "cloud_kitchen",
    CAFE: "cafe",
    BAKERY: "bakery",
    OTHER: "other",
  },


  // Order Status
  ORDER_STATUS: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PREPARING: "preparing",
    READY_FOR_PICKUP: "ready_for_pickup",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
  },

  // Payment Methods
  PAYMENT_METHODS: {
    CASH_ON_DELIVERY: "cash_on_delivery",
    CARD: "card",
    UPI: "upi",
    WALLET: "wallet",
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },

  // JWT
  JWT: {
    EXPIRES_IN: "24h",
    REFRESH_EXPIRES_IN: "7d",
  },

  // Email Templates
  EMAIL_TEMPLATES: {
    WELCOME: "welcome",
    ORDER_CONFIRMATION: "order_confirmation",
    ORDER_STATUS_UPDATE: "order_status_update",
    PASSWORD_RESET: "password_reset",
  },

  // Restaurant Status
  RESTAURANT_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING_VERIFICATION: "pending_verification",
    SUSPENDED: "suspended",
  },

  // Address Types
  ADDRESS_TYPES: {
    HOME: "home",
    WORK: "work",
    OTHER: "other",
  },

  // Dietary Preferences
  DIETARY_PREFERENCES: {
    VEGETARIAN: "vegetarian",
    VEGAN: "vegan",
    GLUTEN_FREE: "gluten_free",
    DAIRY_FREE: "dairy_free",
    HALAL: "halal",
    KOSHER: "kosher",
  },

  // Cuisine Types
  CUISINE_TYPES: [
    "American",
    "Chinese",
    "Indian",
    "Italian",
    "Mexican",
    "Thai",
    "Japanese",
    "Mediterranean",
    "Fast Food",
    "Pizza",
    "Burgers",
    "Desserts",
    "Beverages",
  ],

  // Menu Categories
  MENU_CATEGORIES: [
    "Appetizers",
    "Main Course",
    "Desserts",
    "Beverages",
    "Sides",
    "Salads",
    "Soups",
    "Sandwiches",
    "Pizza",
    "Burgers",
    "Pasta",
    "Rice",
    "Bread",
  ],
};
