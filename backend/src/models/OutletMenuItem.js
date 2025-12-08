const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const OutletMenuItem = sequelize.define(
  "OutletMenuItem",
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
    menu_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "menu_items",
        key: "id",
      },
    },
    outlet_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "If different from base price",
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "For items with limited stock",
    },
  },
  {
    tableName: "outlet_menu_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["outlet_id", "menu_item_id"],
      },
    ],
  }
);

module.exports = OutletMenuItem;
