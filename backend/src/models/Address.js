const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50],
      },
    },
    recipient_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 15],
      },
    },
    street_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    apartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 10],
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
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
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    address_type: {
      type: DataTypes.ENUM("home", "work", "other"),
      defaultValue: "home",
    },
    landmark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "addresses",
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["is_default"],
      },
      {
        fields: ["latitude", "longitude"],
      },
    ],
  }
);

// Instance methods
Address.prototype.setAsDefault = async function () {
  // Remove default from other addresses of the same user
  await Address.update(
    { is_default: false },
    {
      where: {
        user_id: this.user_id,
        id: { [sequelize.Op.ne]: this.id },
      },
    }
  );

  // Set this address as default
  this.is_default = true;
  return this.save();
};

Address.prototype.getFullAddress = function () {
  const parts = [
    this.street_address,
    this.apartment,
    this.landmark,
    this.city,
    this.state,
    this.pincode,
    this.country,
  ].filter(Boolean);

  return parts.join(", ");
};

// Class methods
Address.findByUser = function (userId) {
  return this.findAll({
    where: {
      user_id: userId,
      is_active: true,
    },
    order: [
      ["is_default", "DESC"],
      ["created_at", "DESC"],
    ],
  });
};

Address.findDefaultByUser = function (userId) {
  return this.findOne({
    where: {
      user_id: userId,
      is_default: true,
      is_active: true,
    },
  });
};

Address.createDefault = async function (userId, addressData) {
  // If this is the first address, make it default
  const existingAddresses = await this.count({
    where: { user_id: userId },
  });

  if (existingAddresses === 0) {
    addressData.is_default = true;
  }

  return this.create(addressData);
};

module.exports = Address;
