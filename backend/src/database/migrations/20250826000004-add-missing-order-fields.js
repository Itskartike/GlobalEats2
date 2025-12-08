"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add only the missing fields to orders table
    await queryInterface.addColumn("orders", "refund_reason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("orders", "rating", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("orders", "review", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("orders", "review_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("orders", "refund_reason");
    await queryInterface.removeColumn("orders", "rating");
    await queryInterface.removeColumn("orders", "review");
    await queryInterface.removeColumn("orders", "review_date");
  },
};
