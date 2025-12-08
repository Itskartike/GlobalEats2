"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("brands", {
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
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      logo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      banner_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      cuisine_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
      total_reviews: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      minimum_order_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      delivery_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      estimated_delivery_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "In minutes",
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
    await queryInterface.addIndex("brands", ["is_active"]);
    await queryInterface.addIndex("brands", ["is_featured"]);
    await queryInterface.addIndex("brands", ["cuisine_type"]);
    await queryInterface.addIndex("brands", ["slug"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("brands");
  },
};
