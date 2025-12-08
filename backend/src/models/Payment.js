const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "orders", key: "id" },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "upi", "wallet", "netbanking"),
      allowNull: false,
      defaultValue: "upi",
    },
    payment_provider: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "e.g., Razorpay, Stripe, PayU",
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: "Internal payment reference",
    },
    gateway_transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Gateway ref (e.g., rzp_order_xxx / rzp_payment_xxx)",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "success",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    gateway_response: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    failure_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "payments",
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["order_id"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
    ],
  }
);

module.exports = Payment;



