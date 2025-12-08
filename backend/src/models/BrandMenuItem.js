const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const BrandMenuItem = sequelize.define(
  "BrandMenuItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "brands",
        key: "id",
      },
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_vegetarian: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_vegan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_gluten_free: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    spice_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 4,
      },
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    preparation_time: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "menu_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = BrandMenuItem;
