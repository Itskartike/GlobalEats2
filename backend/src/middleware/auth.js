const jwt = require("jsonwebtoken");
const { User } = require("../models/associations");

// Enhanced JWT token verification with better error handling
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from multiple sources (header, query, cookie)
    let token = null;

    // Check Authorization header first
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Check query parameter as fallback
    if (!token && req.query.token) {
      token = req.query.token;
    }

    // Check cookie as another fallback
    if (!token && req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
        code: "TOKEN_MISSING",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT decoded payload:", decoded);

    // Get user from database
    const user = await User.findByPk(decoded.userId);
    console.log(
      "User found from JWT:",
      user ? { id: user.id, email: user.email, name: user.name } : "NULL"
    );

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive user",
        code: "USER_INVALID",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "TOKEN_INVALID",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if user has required role(s)
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role;

    if (Array.isArray(roles)) {
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }
    } else {
      if (userRole !== roles) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user owns the resource
const checkOwnership = (model, paramName = "id") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await model.findByPk(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      // Check if user owns the resource
      const ownerField = model.name === "Restaurant" ? "owner_id" : "user_id";

      if (resource[ownerField] !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Generate JWT token - shorter expiration for better security
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  authenticateToken,
  checkRole,
  optionalAuth,
  checkOwnership,
  generateToken,
  generateRefreshToken,
};
