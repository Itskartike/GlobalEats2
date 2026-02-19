"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Clean up from any partial previous run
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS "vendor_profiles" CASCADE;`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_vendor_profiles_business_type";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_vendor_profiles_status";`);

    // Create business_type ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_vendor_profiles_business_type" AS ENUM('restaurant', 'cloud_kitchen', 'cafe', 'bakery', 'other');
    `);

    // Create vendor status ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_vendor_profiles_status" AS ENUM('pending', 'approved', 'suspended', 'rejected');
    `);

    await queryInterface.createTable("vendor_profiles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      business_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      business_type: {
        type: Sequelize.ENUM(
          "restaurant",
          "cloud_kitchen",
          "cafe",
          "bakery",
          "other"
        ),
        allowNull: false,
        defaultValue: "restaurant",
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
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      gst_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      fssai_license: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      pan_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      bank_details: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: null,
      },
      documents: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      commission_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 15.0,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "suspended", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      status_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          auto_accept_orders: false,
          notification_preferences: {
            email: true,
            sms: false,
            push: true,
          },
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes
    await queryInterface.addIndex("vendor_profiles", ["user_id"], {
      unique: true,
    });
    await queryInterface.addIndex("vendor_profiles", ["status"]);
    await queryInterface.addIndex("vendor_profiles", ["business_type"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("vendor_profiles");
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_vendor_profiles_business_type";`
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_vendor_profiles_status";`
    );
  },
};
