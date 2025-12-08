const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const Outlet = sequelize.define(
  "Outlet",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "brands",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: "India",
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_delivery_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_pickup_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    delivery_radius: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.0,
    },
    operating_hours: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        monday: { open: "09:00", close: "22:00", is_open: true },
        tuesday: { open: "09:00", close: "22:00", is_open: true },
        wednesday: { open: "09:00", close: "22:00", is_open: true },
        thursday: { open: "09:00", close: "22:00", is_open: true },
        friday: { open: "09:00", close: "22:00", is_open: true },
        saturday: { open: "09:00", close: "23:00", is_open: true },
        sunday: { open: "10:00", close: "23:00", is_open: true },
      },
    },
  },
  {
    tableName: "outlets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Outlet;
