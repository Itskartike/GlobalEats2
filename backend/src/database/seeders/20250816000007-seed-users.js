"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        name: "John Doe",
        email: "john@example.com",
        phone: "+91-9876543210",
        password: bcrypt.hashSync("password123", 10),
        role: "customer",
        is_verified: true,
        is_active: true,
        email_verified_at: new Date(),
        preferences: JSON.stringify({}),
        notification_settings: JSON.stringify({
          email: true,
          sms: false,
          push: true,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+91-9876543211",
        password: bcrypt.hashSync("password123", 10),
        role: "customer",
        is_verified: true,
        is_active: true,
        email_verified_at: new Date(),
        preferences: JSON.stringify({ dietary: "vegetarian" }),
        notification_settings: JSON.stringify({
          email: true,
          sms: true,
          push: true,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        name: "Admin User",
        email: "admin@globaleats.com",
        phone: "+91-9876543212",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin",
        is_verified: true,
        is_active: true,
        email_verified_at: new Date(),
        preferences: JSON.stringify({}),
        notification_settings: JSON.stringify({
          email: true,
          sms: true,
          push: true,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
