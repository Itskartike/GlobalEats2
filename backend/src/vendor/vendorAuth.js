const jwt = require("jsonwebtoken");
const { User, VendorProfile } = require("../models/associations");

/**
 * Middleware to verify vendor JWT and check vendor status.
 * Rejects if: no token, invalid token, user not found, role !== 'vendor',
 * user inactive, or vendor profile not approved.
 * Attaches req.user and req.vendor (VendorProfile) to the request.
 */
const vendorAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: VendorProfile,
          as: "vendorProfile",
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    if (user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Vendor privileges required.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive.",
      });
    }

    if (!user.vendorProfile) {
      return res.status(403).json({
        success: false,
        message: "Vendor profile not found. Please complete registration.",
      });
    }

    if (user.vendorProfile.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: `Vendor account is ${user.vendorProfile.status}. ${
          user.vendorProfile.status === "pending"
            ? "Please wait for admin approval."
            : user.vendorProfile.status_reason || ""
        }`,
        vendorStatus: user.vendorProfile.status,
      });
    }

    req.user = user;
    req.vendor = user.vendorProfile;
    next();
  } catch (error) {
    console.error("Vendor auth error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Like vendorAuth but allows pending/suspended vendors to access
 * their profile and pending screen. Only blocks if no profile found.
 */
const vendorAuthPending = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: VendorProfile,
          as: "vendorProfile",
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    if (user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Vendor privileges required.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive.",
      });
    }

    req.user = user;
    req.vendor = user.vendorProfile || null;
    next();
  } catch (error) {
    console.error("Vendor auth (pending) error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Helper to scope database queries to the current vendor's resources.
 * Returns { owner_id: userId } for use in Sequelize where clauses.
 */
const scopeToVendor = (req) => {
  return { owner_id: req.user.id };
};

module.exports = { vendorAuth, vendorAuthPending, scopeToVendor };
