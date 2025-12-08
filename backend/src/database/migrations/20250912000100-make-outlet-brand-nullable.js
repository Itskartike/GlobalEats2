"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make brand_id nullable to allow creating outlets without immediate brand link
    await queryInterface.changeColumn("outlets", "brand_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "brands",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to NOT NULL (original behavior)
    await queryInterface.changeColumn("outlets", "brand_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "brands",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};


