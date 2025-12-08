const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticateToken } = require("../middleware/auth");

// Create a new order
router.post("/", authenticateToken, orderController.createOrder);

// Get user's order history
router.get("/history", authenticateToken, orderController.getOrderHistory);

// Get specific order details
router.get("/:orderId", authenticateToken, orderController.getOrderDetails);

// Update order status (for restaurant/admin)
router.patch(
  "/:orderId/status",
  authenticateToken,
  orderController.updateOrderStatus
);

// Cancel order
router.patch(
  "/:orderId/cancel",
  authenticateToken,
  orderController.cancelOrder
);

// Add order rating and review
router.post(
  "/:orderId/review",
  authenticateToken,
  orderController.addOrderReview
);

module.exports = router;
