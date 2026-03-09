const express = require("express");
const router = express.Router();
const { Order, Payment } = require("../models/associations");
const { getRazorpayInstance, verifySignature } = require("../services/razorpayService");
const auth = require("../middleware/auth");

// Create Razorpay order for an existing Order
router.post("/create-order", auth.authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "orderId is required" });

    const order = await Order.findOne({ where: { id: orderId, user_id: userId } });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const amountPaise = Math.round(Number(order.total_amount) * 100);
    const rzp = getRazorpayInstance();
    const rzpOrder = await rzp.orders.create({ amount: amountPaise, currency: "INR", receipt: order.order_number });

    const payment = await Payment.create({
      order_id: order.id,
      user_id: userId,
      payment_method: order.payment_method || "upi",
      payment_provider: "Razorpay",
      transaction_id: rzpOrder.id,
      gateway_transaction_id: rzpOrder.id,
      amount: order.total_amount,
      currency: "INR",
      status: "pending",
      gateway_response: rzpOrder,
    });

    res.json({ success: true, data: { razorpayOrder: rzpOrder, paymentId: payment.id, keyId: process.env.RAZORPAY_KEY_ID } });
  } catch (err) {
    next(err);
  }
});

// Verify payment after checkout
router.post("/verify", auth.authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ success: false, message: "Missing Razorpay verification fields" });
    }

    const isValid = verifySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (!isValid) return res.status(400).json({ success: false, message: "Invalid signature" });

    const payment = await Payment.findOne({ where: { id: paymentId, user_id: userId } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    await payment.update({
      status: "success",
      gateway_transaction_id: razorpay_payment_id,
    });

    await Order.update({ payment_status: "paid" }, { where: { id: payment.order_id, user_id: userId } });

    res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    next(err);
  }
});

// Razorpay webhook (set secret in dashboard)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const crypto = require("crypto");
  const payload = req.body;
  const expected = crypto.createHmac("sha256", secret).update(req.rawBody || JSON.stringify(payload)).digest("hex");
  if (signature !== expected) return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  try {
    if (payload.event === "payment.captured") {
      const paymentId = payload.payload.payment.entity.id;
      await Payment.update({ status: "success" }, { where: { gateway_transaction_id: paymentId } });
    }
  } catch (e) {}
  res.json({ status: "ok" });
});

// List user transactions (with associated order info)
router.get("/my", auth.authenticateToken, async (req, res, next) => {
  try {
    const { Order } = require("../models/associations");
    const { Op } = require("sequelize");
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User ID not found in token" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status;

    const whereClause = { user_id: userId };
    if (statusFilter && statusFilter !== "all") {
      whereClause.status = statusFilter;
    }

    const { rows, count } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_number", "total_amount", "status"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    // Compute summary stats over ALL user transactions (for the summary cards)
    const allPayments = await Payment.findAll({
      where: { user_id: userId },
      attributes: ["amount", "status", "refund_amount"],
    });
    const totalSpent = allPayments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const totalRefunded = allPayments.reduce(
      (sum, p) => sum + Number(p.refund_amount || 0),
      0
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
      summary: {
        totalSpent: totalSpent.toFixed(2),
        totalRefunded: totalRefunded.toFixed(2),
        totalTransactions: count,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
