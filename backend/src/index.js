const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Load environment variables from the correct path
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Debug environment variables
console.log("🔧 Environment Debug:");
console.log("Working Directory:", process.cwd());
console.log("Script Directory:", __dirname);
console.log("ENV File Path:", path.join(__dirname, "..", ".env"));
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES" : "NO");
console.log(
  "JWT_SECRET length:",
  process.env.JWT_SECRET ? process.env.JWT_SECRET.length : "undefined"
);

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
const testRoutes = require("./routes/test");

// Admin routes
const adminRoutes = require("./admin/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001", // Frontend dev server
      "http://localhost:5173", // Vite default port
      "http://localhost:4173", // Vite preview port
      process.env.APP_URL || "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for development - limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
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
app.use("/api/auth", authRoutes);
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
app.use("/api/test", testRoutes);

// Admin routes (Protected)
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

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
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

    // Test email configuration
    await testEmailConfig();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 GlobalEats API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`📧 Email configured: ${process.env.SMTP_USER ? 'YES' : 'NO'}`);
      console.log(
        `🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
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

