"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "categories",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal("gen_random_uuid()"),
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        image_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        sort_order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        ifNotExists: true,
      }
    );

    // Add indexes
    await queryInterface.addIndex("categories", ["is_active"], {
      concurrently: true,
    });
    await queryInterface.addIndex("categories", ["sort_order"], {
      concurrently: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("categories");
  },
};
