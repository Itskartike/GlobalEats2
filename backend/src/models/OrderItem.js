const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    menu_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "menu_items",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 50,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    customization: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preparation_time: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true,
    },
    ready_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: "order_items",
    underscored: true,
    indexes: [
      {
        fields: ["order_id"],
      },
      {
        fields: ["menu_item_id"],
      },
    ],
  }
);

// Instance methods
OrderItem.prototype.calculateTotal = function () {
  this.total_price = this.unit_price * this.quantity;
  return this.total_price;
};

OrderItem.prototype.updateStatus = async function (newStatus, notes = {}) {
  this.status = newStatus;

  if (newStatus === "ready") {
    this.ready_at = new Date();
  }

  if (notes) {
    this.notes = { ...this.notes, ...notes };
  }

  return this.save();
};

// Class methods
OrderItem.findByOrder = function (orderId) {
  return this.findAll({
    where: { order_id: orderId },
    include: [
      {
        model: sequelize.models.MenuItem,
        attributes: ["id", "name", "description", "image_url"],
      },
    ],
    order: [["created_at", "ASC"]],
  });
};

OrderItem.getOrderSummary = function (orderId) {
  return this.findAll({
    where: { order_id: orderId },
    attributes: [
      [sequelize.fn("SUM", sequelize.col("total_price")), "order_total"],
      [sequelize.fn("COUNT", sequelize.col("id")), "item_count"],
    ],
    group: ["order_id"],
  });
};

module.exports = OrderItem;
