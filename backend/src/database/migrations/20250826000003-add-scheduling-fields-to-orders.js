"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("orders", "is_scheduled", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn("orders", "scheduled_time", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("orders", "restaurant_notes", {
      type: Sequelize.JSONB,
      defaultValue: {},
    });

    await queryInterface.addColumn("orders", "customer_notes", {
      type: Sequelize.JSONB,
      defaultValue: {},
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("orders", "is_scheduled");
    await queryInterface.removeColumn("orders", "scheduled_time");
    await queryInterface.removeColumn("orders", "restaurant_notes");
    await queryInterface.removeColumn("orders", "customer_notes");
  },
};
