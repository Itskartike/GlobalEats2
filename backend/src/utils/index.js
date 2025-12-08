const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (payload, expiresIn = "24h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Generate order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `GE${timestamp}${random}`.toUpperCase();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Slugify string
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

/**
 * Paginate array
 */
const paginate = (array, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const paginatedItems = array.slice(offset, offset + limit);

  return {
    data: paginatedItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: array.length,
      totalPages: Math.ceil(array.length / limit),
      hasNext: page < Math.ceil(array.length / limit),
      hasPrev: page > 1,
    },
  };
};

/**
 * Remove sensitive data from user object
 */
const sanitizeUser = (user) => {
  const { password_hash, ...sanitizedUser } = user.toJSON
    ? user.toJSON()
    : user;
  return sanitizedUser;
};

/**
 * Generate random OTP
 */
const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
};

/**
 * Check if time is between two times
 */
const isTimeBetween = (time, startTime, endTime) => {
  const timeDate = new Date(`1970-01-01T${time}`);
  const startDate = new Date(`1970-01-01T${startTime}`);
  const endDate = new Date(`1970-01-01T${endTime}`);

  if (startDate <= endDate) {
    return timeDate >= startDate && timeDate <= endDate;
  } else {
    // Handle overnight timing (e.g., 22:00 to 06:00)
    return timeDate >= startDate || timeDate <= endDate;
  }
};

/**
 * Get estimated delivery time
 */
const getEstimatedDeliveryTime = (
  preparationTime = 30,
  deliveryDistance = 5
) => {
  const travelTime = Math.ceil(deliveryDistance * 3); // Assume 3 minutes per km
  const totalMinutes = preparationTime + travelTime;

  const now = new Date();
  const estimatedTime = new Date(now.getTime() + totalMinutes * 60000);

  return estimatedTime;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateRandomString,
  calculateDistance,
  formatCurrency,
  generateOrderNumber,
  isValidEmail,
  isValidPhone,
  slugify,
  paginate,
  sanitizeUser,
  generateOTP,
  isTimeBetween,
  getEstimatedDeliveryTime,
};
