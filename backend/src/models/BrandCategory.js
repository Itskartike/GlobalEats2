const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const BrandCategory = sequelize.define(
  "BrandCategory",
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
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
  },
  {
    tableName: "brand_categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["brand_id", "category_id"],
      },
    ],
  }
);

module.exports = BrandCategory;
