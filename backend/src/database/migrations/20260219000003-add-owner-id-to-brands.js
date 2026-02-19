"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("brands", "owner_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("brands", ["owner_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("brands", "owner_id");
  },
};
