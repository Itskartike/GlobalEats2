const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/config/database");

const Restaurant = sequelize.define(
  "Restaurant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    banner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cuisine_types: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    opening_hours: {
      type: DataTypes.JSONB,
      defaultValue: {
        monday: { open: "09:00", close: "22:00", is_open: true },
        tuesday: { open: "09:00", close: "22:00", is_open: true },
        wednesday: { open: "09:00", close: "22:00", is_open: true },
        thursday: { open: "09:00", close: "22:00", is_open: true },
        friday: { open: "09:00", close: "23:00", is_open: true },
        saturday: { open: "09:00", close: "23:00", is_open: true },
        sunday: { open: "10:00", close: "22:00", is_open: true },
      },
    },
    delivery_radius: {
      type: DataTypes.INTEGER,
      defaultValue: 5000, // in meters
      validate: {
        min: 1000,
        max: 50000,
      },
    },
    minimum_order: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    avg_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    total_ratings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "pending", "suspended"),
      defaultValue: "pending",
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.0, // percentage
      validate: {
        min: 0,
        max: 100,
      },
    },
    bank_details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    documents: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        auto_accept_orders: false,
        max_preparation_time: 45, // minutes
        allow_customization: true,
        require_approval: false,
      },
    },
  },
  {
    tableName: "restaurants",
    underscored: true,
    indexes: [
      {
        fields: ["latitude", "longitude"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["city"],
      },
      {
        fields: ["cuisine_types"],
      },
    ],
  }
);

// Instance methods
Restaurant.prototype.isOpen = function () {
  const now = new Date();
  const day = now.toLocaleLowerCase().slice(0, 3);
  const time = now.toTimeString().slice(0, 5);

  const todayHours = this.opening_hours[day];
  if (!todayHours || !todayHours.is_open) return false;

  return time >= todayHours.open && time <= todayHours.close;
};

Restaurant.prototype.updateRating = async function (newRating) {
  const totalRating = this.avg_rating * this.total_ratings + newRating;
  this.total_ratings += 1;
  this.avg_rating = totalRating / this.total_ratings;
  return this.save();
};

// Class methods
Restaurant.findNearby = function (lat, lng, radius = 5000) {
  return this.findAll({
    where: {
      status: "active",
      is_verified: true,
    },
    attributes: {
      include: [
        [
          sequelize.literal(`
            ST_Distance(
              ST_MakePoint(longitude, latitude)::geography,
              ST_MakePoint(${lng}, ${lat})::geography
            )
          `),
          "distance",
        ],
      ],
    },
    having: sequelize.literal(`distance <= ${radius}`),
    order: sequelize.literal("distance ASC"),
  });
};

Restaurant.findByCuisine = function (cuisineType) {
  return this.findAll({
    where: {
      status: "active",
      is_verified: true,
      cuisine_types: {
        [sequelize.Op.contains]: [cuisineType],
      },
    },
  });
};

module.exports = Restaurant;
