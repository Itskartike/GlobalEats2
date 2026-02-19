"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("outlets", "owner_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("outlets", ["owner_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("outlets", "owner_id");
  },
};
