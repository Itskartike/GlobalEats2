const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const OutletBrand = sequelize.define(
  "OutletBrand",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    outlet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "outlets",
        key: "id",
      },
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "brands",
        key: "id",
      },
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    preparation_time: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: "Preparation time in minutes",
    },
    minimum_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.0,
      comment: "Commission rate as percentage",
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Display priority (1 = highest)",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "outlet_brands",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["outlet_id", "brand_id"],
        name: "outlet_brand_unique",
      },
    ],
  }
);

module.exports = OutletBrand;
