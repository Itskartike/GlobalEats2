const { DataTypes, Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sequelize } = require("../database/config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [2, 255],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        len: [10, 20],
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.ENUM("customer", "admin", "restaurant", "delivery"),
      allowNull: false,
      defaultValue: "customer",
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    notification_settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        email: true,
        sms: false,
        push: true,
      },
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
  }
);

// Instance methods
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.getPublicProfile = function () {
  const { password, ...publicData } = this.toJSON();
  return publicData;
};

User.prototype.markEmailAsVerified = async function () {
  this.is_verified = true;
  this.email_verified_at = new Date();
  await this.save();
};

User.prototype.updatePreferences = async function (newPreferences) {
  this.preferences = { ...this.preferences, ...newPreferences };
  await this.save();
};

User.prototype.updateNotificationSettings = async function (newSettings) {
  this.notification_settings = {
    ...this.notification_settings,
    ...newSettings,
  };
  await this.save();
};

User.prototype.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.password_reset_token = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.password_reset_expires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Static methods
User.findByEmail = async function (email) {
  return await this.findOne({ where: { email } });
};

User.findActiveUsers = async function () {
  return await this.findAll({ where: { is_active: true } });
};

User.findByRole = async function (role) {
  return await this.findAll({ where: { role } });
};

User.createUser = async function (userData) {
  return await this.create(userData);
};

User.findByPasswordResetToken = async function (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return await this.findOne({
    where: {
      password_reset_token: hashedToken,
      password_reset_expires: { [Op.gt]: Date.now() },
    },
  });
};

User.prototype.resetPassword = async function (newPassword) {
  this.password = newPassword;
  this.password_reset_token = null;
  this.password_reset_expires = null;
  await this.save();
};

module.exports = User;
