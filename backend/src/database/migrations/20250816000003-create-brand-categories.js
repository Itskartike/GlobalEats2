"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("brand_categories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
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
        onDelete: "CASCADE",
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

    // Add unique constraint - foreign key indexes are created automatically
    await queryInterface.addConstraint("brand_categories", {
      fields: ["brand_id", "category_id"],
      type: "unique",
      name: "unique_brand_category",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("brand_categories");
  },
};
