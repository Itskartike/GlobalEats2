const { User } = require("../models");
const { validationResult } = require("express-validator");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../constants");
const { generatePagination } = require("../utils");
const multer = require("multer");
const path = require("path");

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
    }

    const profile = user.getPublicProfile();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user: profile },
      message: "Profile retrieved successfully",
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors.array(),
        },
      });
    }

    const userId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.id;
    delete updateData.email; // Email updates should go through separate verification
    delete updateData.password; // Password updates should go through separate endpoint
    delete updateData.role; // Role updates should be admin only
    delete updateData.isEmailVerified;
    delete updateData.isPhoneVerified;
    delete updateData.emailVerificationToken;
    delete updateData.phoneVerificationToken;
    delete updateData.passwordResetToken;
    delete updateData.passwordResetExpires;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
    }

    // Update user data
    await user.update(updateData);

    const updatedProfile = user.getPublicProfile();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user: updatedProfile },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
          })),
        },
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: "PHONE_ALREADY_EXISTS",
          message: "Phone number already exists",
        },
      });
    }

    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
        success: false,
        error: {
          code: "NO_FILE_UPLOADED",
          message: "No image file uploaded",
        },
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
    }

    // Construct the image URL
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/profiles/${req.file.filename}`;

    // Update user profile image
    await user.update({ profileImage: imageUrl });

    const updatedProfile = user.getPublicProfile();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: updatedProfile,
        imageUrl: imageUrl,
      },
      message: "Profile image uploaded successfully",
    });
  } catch (error) {
    console.error("Upload profile image error:", error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
};

// Update preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== "object") {
      return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
        success: false,
        error: {
          code: "INVALID_PREFERENCES",
          message: "Invalid preferences data",
        },
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
    }

    // Merge with existing preferences
    const currentPreferences = user.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
    };

    await user.update({ preferences: updatedPreferences });

    const updatedProfile = user.getPublicProfile();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user: updatedProfile },
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
};

// Delete user account (soft delete)
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
    }

    // Soft delete by setting isActive to false
    await user.update({ isActive: false });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
};

// Admin only: Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Add filters
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === "true";

    // Add search functionality
    if (search) {
      const { Op } = require("sequelize");
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: [
          "password",
          "emailVerificationToken",
          "phoneVerificationToken",
          "passwordResetToken",
        ],
      },
    });

    const pagination = generatePagination(count, page, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        users,
        pagination,
      },
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
};

// Admin only: Get user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "password",
          "emailVerificationToken",
          "phoneVerificationToken",
          "passwordResetToken",
        ],
      },
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user },
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
};

// Admin only: Update user role or status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    await user.update(updateData);

    const updatedUser = user.getPublicProfile();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user: updatedUser },
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  updatePreferences,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserStatus,
  uploadMiddleware: upload.single("profileImage"),
};
