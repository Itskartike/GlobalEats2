const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const VendorProfile = sequelize.define(
  "VendorProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    business_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [2, 255],
        notEmpty: true,
      },
    },
    business_type: {
      type: DataTypes.ENUM(
        "restaurant",
        "cloud_kitchen",
        "cafe",
        "bakery",
        "other"
      ),
      allowNull: false,
      defaultValue: "restaurant",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    banner_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    gst_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    fssai_license: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    pan_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    bank_details: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    documents: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 15.0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "suspended", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    status_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        auto_accept_orders: false,
        notification_preferences: {
          email: true,
          sms: false,
          push: true,
        },
      },
    },
  },
  {
    tableName: "vendor_profiles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["user_id"], unique: true },
      { fields: ["status"] },
      { fields: ["business_type"] },
    ],
  }
);

// Instance methods
VendorProfile.prototype.isApproved = function () {
  return this.status === "approved";
};

VendorProfile.prototype.isPending = function () {
  return this.status === "pending";
};

VendorProfile.prototype.getPublicProfile = function () {
  const data = this.toJSON();
  // Remove sensitive fields
  delete data.bank_details;
  delete data.documents;
  delete data.pan_number;
  return data;
};

module.exports = VendorProfile;
