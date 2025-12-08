"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("menu_items", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      brand_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "brands",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      name: {
        type: Sequelize.STRING(150),
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
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      is_vegetarian: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_vegan: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_gluten_free: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spice_level: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "0=None, 1=Mild, 2=Medium, 3=Hot, 4=Extra Hot",
      },
      calories: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      preparation_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Time in minutes",
      },
      is_available: {
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
    });

    // Add indexes
    await queryInterface.addIndex("menu_items", ["is_available"]);
    await queryInterface.addIndex("menu_items", ["is_vegetarian"]);
    await queryInterface.addIndex("menu_items", ["sort_order"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("menu_items");
  },
};
