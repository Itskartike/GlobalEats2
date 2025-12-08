// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,

  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // Restaurants
  RESTAURANTS: {
    LIST: "/restaurants",
    DETAIL: (id: string) => `/restaurants/${id}`,
    SEARCH: "/restaurants/search",
    FEATURED: "/restaurants/featured",
    NEARBY: "/restaurants/nearby",
    MENU: (id: string) => `/restaurants/${id}/menu`,
  },

  // Orders
  ORDERS: {
    CREATE: "/orders",
    LIST: "/orders",
    DETAIL: (id: string) => `/orders/${id}`,
    TRACK: (id: string) => `/orders/${id}/track`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    RATE: (id: string) => `/orders/${id}/rate`,
    REORDER: (id: string) => `/orders/${id}/reorder`,
  },

  // User
  USER: {
    ADDRESSES: "/users/addresses",
    ADDRESS: (id: string) => `/users/addresses/${id}`,
    FAVORITES: "/users/favorites",
    PREFERENCES: "/users/preferences",
  },
};

// Application Routes
export const APP_ROUTES = {
  HOME: "/",
  RESTAURANTS: "/restaurants",
  RESTAURANT_DETAIL: (id: string) => `/restaurants/${id}`,
  MENU: (restaurantId: string, outletId: string) =>
    `/restaurants/${restaurantId}/outlets/${outletId}/menu`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_TRACKING: (id: string) => `/orders/${id}/track`,
  PROFILE: "/profile",
  ADDRESSES: "/profile/addresses",
  FAVORITES: "/profile/favorites",
  HELP: "/help",
  ABOUT: "/about",
  CONTACT: "/contact",
  TERMS: "/terms",
  PRIVACY: "/privacy",
};

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY_FOR_PICKUP: "ready_for_pickup",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Order Placed",
  [ORDER_STATUS.CONFIRMED]: "Order Confirmed",
  [ORDER_STATUS.PREPARING]: "Being Prepared",
  [ORDER_STATUS.READY_FOR_PICKUP]: "Ready for Pickup",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
  [ORDER_STATUS.REFUNDED]: "Refunded",
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: "cash_on_delivery",
  CARD: "card",
  UPI: "upi",
  WALLET: "wallet",
} as const;

// Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH_ON_DELIVERY]: "Cash on Delivery",
  [PAYMENT_METHODS.CARD]: "Credit/Debit Card",
  [PAYMENT_METHODS.UPI]: "UPI",
  [PAYMENT_METHODS.WALLET]: "Wallet",
};

// Cuisine Types
export const CUISINE_TYPES = [
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
];

// Dietary Preferences
export const DIETARY_PREFERENCES = {
  VEGETARIAN: "vegetarian",
  VEGAN: "vegan",
  GLUTEN_FREE: "gluten_free",
  DAIRY_FREE: "dairy_free",
  HALAL: "halal",
  KOSHER: "kosher",
} as const;

// Address Types
export const ADDRESS_TYPES = {
  HOME: "home",
  WORK: "work",
  OTHER: "other",
} as const;

// Address Type Labels
export const ADDRESS_TYPE_LABELS = {
  [ADDRESS_TYPES.HOME]: "Home",
  [ADDRESS_TYPES.WORK]: "Work",
  [ADDRESS_TYPES.OTHER]: "Other",
};

// Sort Options
export const SORT_OPTIONS = {
  RELEVANCE: "relevance",
  RATING: "rating",
  DELIVERY_TIME: "delivery_time",
  PRICE_LOW_TO_HIGH: "price_low_to_high",
  PRICE_HIGH_TO_LOW: "price_high_to_low",
  POPULARITY: "popularity",
} as const;

// Sort Option Labels
export const SORT_OPTION_LABELS = {
  [SORT_OPTIONS.RELEVANCE]: "Relevance",
  [SORT_OPTIONS.RATING]: "Rating",
  [SORT_OPTIONS.DELIVERY_TIME]: "Delivery Time",
  [SORT_OPTIONS.PRICE_LOW_TO_HIGH]: "Price: Low to High",
  [SORT_OPTIONS.PRICE_HIGH_TO_LOW]: "Price: High to Low",
  [SORT_OPTIONS.POPULARITY]: "Popularity",
};

// Filter Options
export const FILTER_OPTIONS = {
  PRICE_RANGE: {
    BUDGET: { min: 0, max: 200, label: "Under ₹200" },
    MID_RANGE: { min: 200, max: 500, label: "₹200 - ₹500" },
    PREMIUM: { min: 500, max: 1000, label: "₹500 - ₹1000" },
    LUXURY: { min: 1000, max: null, label: "Above ₹1000" },
  },
  DELIVERY_TIME: {
    FAST: { max: 30, label: "Under 30 mins" },
    MEDIUM: { max: 45, label: "Under 45 mins" },
    SLOW: { max: 60, label: "Under 60 mins" },
  },
  RATING: {
    EXCELLENT: { min: 4.5, label: "4.5+" },
    VERY_GOOD: { min: 4.0, label: "4.0+" },
    GOOD: { min: 3.5, label: "3.5+" },
    AVERAGE: { min: 3.0, label: "3.0+" },
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  CART: "cart",
  RECENT_ADDRESSES: "recent_addresses",
  SEARCH_HISTORY: "search_history",
  PREFERENCES: "preferences",
  LOCATION: "location",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Requested resource not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  CART_EMPTY: "Your cart is empty.",
  ADDRESS_REQUIRED: "Please select a delivery address.",
  PAYMENT_FAILED: "Payment failed. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: "Order placed successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  ADDRESS_ADDED: "Address added successfully!",
  ADDRESS_UPDATED: "Address updated successfully!",
  ADDRESS_DELETED: "Address deleted successfully!",
  ITEM_ADDED_TO_CART: "Item added to cart!",
  ITEM_REMOVED_FROM_CART: "Item removed from cart!",
  LOGOUT_SUCCESS: "Logged out successfully!",
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  POSTAL_CODE: /^\d{6}$/,
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy at h:mm a",
  TIME_ONLY: "h:mm a",
  ISO: "yyyy-MM-dd",
};

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type PaymentMethodType =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type AddressTypeType =
  (typeof ADDRESS_TYPES)[keyof typeof ADDRESS_TYPES];
export type SortOptionType = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];
export type DietaryPreferenceType =
  (typeof DIETARY_PREFERENCES)[keyof typeof DIETARY_PREFERENCES];
