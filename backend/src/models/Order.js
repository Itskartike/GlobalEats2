const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "addresses",
        key: "id",
      },
    },
    outlet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "outlets",
        key: "id",
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    coupon_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coupon_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    order_type: {
      type: DataTypes.ENUM("delivery", "pickup"),
      allowNull: false,
      defaultValue: "delivery",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded"
      ),
      defaultValue: "pending",
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "upi", "wallet", "netbanking"),
      allowNull: true,
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estimated_delivery_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actual_delivery_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    preparation_time: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true,
    },
    delivery_time: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true,
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refund_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    review_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_scheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    scheduled_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    restaurant_notes: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    customer_notes: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: "orders",
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["payment_status"],
      },
      {
        fields: ["created_at"],
      },
      {
        fields: ["order_number"],
      },
    ],
  }
);

// Instance methods
Order.prototype.calculateTotal = function () {
  this.total_amount =
    this.subtotal +
    this.delivery_fee +
    this.tax_amount -
    this.discount_amount -
    this.coupon_discount;
  return this.total_amount;
};

Order.prototype.updateStatus = async function (newStatus, notes = {}) {
  this.status = newStatus;

  if (newStatus === "delivered") {
    this.actual_delivery_time = new Date();
  }

  if (notes.restaurant) {
    this.restaurant_notes = { ...this.restaurant_notes, ...notes.restaurant };
  }

  if (notes.customer) {
    this.customer_notes = { ...this.customer_notes, ...notes.customer };
  }

  return this.save();
};

Order.prototype.assignDeliveryAgent = async function (agentId) {
  this.delivery_agent_id = agentId;
  return this.save();
};

// Class methods
Order.generateOrderNumber = function () {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `GE${timestamp}${random}`;
};

Order.findByUser = function (userId, options = {}) {
  const where = { user_id: userId };

  if (options.status) {
    where.status = options.status;
  }

  return this.findAll({
    where,
    include: [
      {
        model: sequelize.models.OrderItem,
        include: [
          {
            model: sequelize.models.MenuItem,
            include: [
              {
                model: sequelize.models.Restaurant,
                attributes: ["id", "name", "logo"],
              },
            ],
          },
        ],
      },
      {
        model: sequelize.models.User,
        as: "DeliveryAgent",
        attributes: ["id", "name", "phone"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: options.limit || 20,
  });
};

Order.findByRestaurant = function (restaurantId, options = {}) {
  return this.findAll({
    include: [
      {
        model: sequelize.models.OrderItem,
        where: {
          restaurant_id: restaurantId,
        },
        include: [
          {
            model: sequelize.models.MenuItem,
            where: { restaurant_id: restaurantId },
          },
        ],
      },
      {
        model: sequelize.models.User,
        attributes: ["id", "name", "phone", "email"],
      },
    ],
    where: options.status ? { status: options.status } : {},
    order: [["created_at", "DESC"]],
  });
};

Order.findByDeliveryAgent = function (agentId, options = {}) {
  const where = { delivery_agent_id: agentId };

  if (options.status) {
    where.status = options.status;
  }

  return this.findAll({
    where,
    include: [
      {
        model: sequelize.models.OrderItem,
        include: [
          {
            model: sequelize.models.MenuItem,
            include: [
              {
                model: sequelize.models.Restaurant,
                attributes: ["id", "name", "address", "phone"],
              },
            ],
          },
        ],
      },
      {
        model: sequelize.models.User,
        attributes: ["id", "name", "phone"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

module.exports = Order;
