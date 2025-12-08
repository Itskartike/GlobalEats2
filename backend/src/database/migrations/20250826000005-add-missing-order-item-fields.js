"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add notes, preparation_time, and ready_at columns to order_items table
    await queryInterface.addColumn("order_items", "notes", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
    });

    await queryInterface.addColumn("order_items", "preparation_time", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Preparation time in minutes",
    });

    await queryInterface.addColumn("order_items", "ready_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    // Remove columns from order_items table
    await queryInterface.removeColumn("order_items", "notes");
    await queryInterface.removeColumn("order_items", "preparation_time");
    await queryInterface.removeColumn("order_items", "ready_at");
  },
};
