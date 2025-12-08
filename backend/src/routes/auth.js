const express = require("express");
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }
  next();
};

// Register validation
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("phone")
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Please provide a valid phone number"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("role")
    .optional()
    .isIn(["customer", "restaurant", "delivery", "admin"])
    .withMessage("Invalid role"),
];

// Login validation
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Forgot password validation
const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
];

// Reset password validation
const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Update profile validation
const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("phone")
    .optional()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Please provide a valid phone number"),
];

// Change password validation
const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Routes
router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  authController.register
);
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  authController.login
);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  handleValidationErrors,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  handleValidationErrors,
  authController.resetPassword
);
router.post("/refresh-token", authController.refreshToken);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/send-verification-email", authenticateToken, authController.sendVerificationEmail);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.put(
  "/profile",
  authenticateToken,
  updateProfileValidation,
  handleValidationErrors,
  authController.updateProfile
);
router.put(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  handleValidationErrors,
  authController.changePassword
);

module.exports = router;
