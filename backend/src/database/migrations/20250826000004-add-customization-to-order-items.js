"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add customization column to order_items table
    await queryInterface.addColumn("order_items", "customization", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });
  },

  async down(queryInterface) {
    // Remove customization column from order_items table
    await queryInterface.removeColumn("order_items", "customization");
  },
};
