"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserSession extends Model {
    static associate(models) {
      UserSession.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  UserSession.init(
    {
      user_id: DataTypes.INTEGER,
      session_token: DataTypes.STRING,
      device_info: DataTypes.JSON,
      ip_address: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
      expires_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserSession",
      tableName: "UserSessions",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return UserSession;
};
