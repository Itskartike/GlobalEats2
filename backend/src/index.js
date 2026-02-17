const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Load environment variables from the correct path
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Validate critical environment variables in production
if (process.env.NODE_ENV === "production") {
  const required = ["JWT_SECRET", "DATABASE_URL"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }
}

const { testConnection, syncDatabase } = require("./database/config/database");
const { testEmailConfig } = require("./services/emailService");

// Import models to ensure associations are loaded
require("./models/associations");
// Only loading Phase 2 models for menu system

// Import routes
const authRoutes = require("./routes/auth");
// const restaurantRoutes = require("./routes/restaurants");
const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
// const userRoutes = require("./routes/users");
const brandRoutes = require("./routes/brands");
const categoryRoutes = require("./routes/categories");
const locationRoutes = require("./routes/location");
const addressRoutes = require("./routes/addresses");
const outletRoutes = require("./routes/outlets");
// Admin routes
const adminRoutes = require("./admin/adminRoutes");

// Test routes (development only)
const testRoutes =
  process.env.NODE_ENV !== "production" ? require("./routes/test") : null;

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy — required when behind a reverse proxy (Render, Heroku, nginx, etc.)
// This ensures rate limiting uses the real client IP from X-Forwarded-For
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.APP_URL,
  "https://frontend-peach-sigma-74.vercel.app",
  "https://frontend-git-main-itskartikes-projects.vercel.app",
  "https://frontend-itskartikes-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:4173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.some((allowed) => origin.startsWith(allowed)) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 200 : 1000,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 1000,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "GlobalEats API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
// app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/outlets", outletRoutes);
// Test routes - only available in development
if (testRoutes) {
  app.use("/api/test", testRoutes);
}

// Admin routes (Protected)
app.use("/api/admin/login", authLimiter);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Sequelize validation errors
  if (error.name === "SequelizeValidationError") {
    const validationErrors = error.errors.map((err) => ({
      field: err.path,
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: validationErrors,
    });
  }

  // Sequelize unique constraint errors
  if (error.name === "SequelizeUniqueConstraintError") {
    const field = error.errors[0].path;
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error response - never leak internal details in production
  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Initialize server
const initializeServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database (create tables)
    await syncDatabase();

    // Test email configuration (non-blocking — don't prevent server from starting)
    testEmailConfig().catch((err) => {
      console.warn("⚠️  Email configuration failed:", err.message);
      console.warn(
        "   Email features will not work until SMTP is configured correctly."
      );
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 GlobalEats API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `📧 Email configured: ${process.env.SMTP_USER ? "YES" : "NO"}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to initialize server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start the server
initializeServer();

module.exports = app;
