"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("outlets", {
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
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      postal_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "India",
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_delivery_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_pickup_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      delivery_radius: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 5.0,
        comment: "Delivery radius in kilometers",
      },
      operating_hours: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Weekly operating schedule",
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
    await queryInterface.addIndex("outlets", ["city"]);
    await queryInterface.addIndex("outlets", ["is_active"]);
    await queryInterface.addIndex("outlets", ["latitude", "longitude"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("outlets");
  },
};
