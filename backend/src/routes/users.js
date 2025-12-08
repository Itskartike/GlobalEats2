const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  updatePreferences,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserStatus,
  uploadMiddleware,
} = require("../controllers/userController");

const { authenticateToken, checkRole } = require("../middleware/auth");

// Profile validation rules
const profileValidation = [
  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("dateOfBirth")
    .optional()
    .isDate()
    .withMessage("Please provide a valid date of birth"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage(
      "Gender must be one of: male, female, other, prefer_not_to_say"
    ),
];

// User preference validation
const preferencesValidation = [
  body("preferences").isObject().withMessage("Preferences must be an object"),
  body("preferences.notifications")
    .optional()
    .isObject()
    .withMessage("Notifications preferences must be an object"),
  body("preferences.dietary")
    .optional()
    .isArray()
    .withMessage("Dietary preferences must be an array"),
  body("preferences.cuisines")
    .optional()
    .isArray()
    .withMessage("Cuisine preferences must be an array"),
];

// Admin validation for user updates
const adminUserValidation = [
  body("role")
    .optional()
    .isIn(["customer", "restaurant_owner", "delivery_partner", "admin"])
    .withMessage(
      "Role must be one of: customer, restaurant_owner, delivery_partner, admin"
    ),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

// User Profile Routes (Protected)
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, profileValidation, updateProfile);
router.post(
  "/profile/image",
  authenticateToken,
  uploadMiddleware,
  uploadProfileImage
);
router.put(
  "/preferences",
  authenticateToken,
  preferencesValidation,
  updatePreferences
);
router.delete("/account", authenticateToken, deleteAccount);

// Admin Routes (Admin Only)
router.get("/", authenticateToken, checkRole(["admin"]), getAllUsers);
router.get("/:userId", authenticateToken, checkRole(["admin"]), getUserById);
router.put(
  "/:userId/status",
  authenticateToken,
  checkRole(["admin"]),
  adminUserValidation,
  updateUserStatus
);

module.exports = router;
