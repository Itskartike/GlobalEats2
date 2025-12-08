"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the old foreign key constraint
    await queryInterface.removeConstraint("orders", "orders_address_id_fkey");

    // Add the new foreign key constraint with ON DELETE SET NULL
    await queryInterface.addConstraint("orders", {
      fields: ["address_id"],
      type: "foreign key",
      name: "orders_address_id_fkey",
      references: {
        table: "addresses",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new foreign key constraint
    await queryInterface.removeConstraint("orders", "orders_address_id_fkey");

    // Add the old foreign key constraint back with ON DELETE RESTRICT
    await queryInterface.addConstraint("orders", {
      fields: ["address_id"],
      type: "foreign key",
      name: "orders_address_id_fkey",
      references: {
        table: "addresses",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
};