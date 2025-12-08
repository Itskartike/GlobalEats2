"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("outlet_menu_items", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      outlet_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "outlets",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      menu_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "menu_items",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      outlet_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "If different from base price",
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "For items with limited stock",
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

    // Add unique constraint and indexes
    await queryInterface.addConstraint("outlet_menu_items", {
      fields: ["outlet_id", "menu_item_id"],
      type: "unique",
      name: "unique_outlet_menu_item",
    });
    await queryInterface.addIndex("outlet_menu_items", ["is_available"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("outlet_menu_items");
  },
};
