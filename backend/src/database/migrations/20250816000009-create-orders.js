"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUMs first - check if they don't already exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_status') THEN
          CREATE TYPE enum_orders_status AS ENUM (
            'pending', 'confirmed', 'preparing', 'ready_for_pickup', 
            'out_for_delivery', 'delivered', 'cancelled', 'refunded'
          );
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_order_type') THEN
          CREATE TYPE enum_orders_order_type AS ENUM ('delivery', 'pickup', 'dine_in');
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_payment_status') THEN
          CREATE TYPE enum_orders_payment_status AS ENUM (
            'pending', 'paid', 'failed', 'refunded', 'partial_refund'
          );
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_payment_method') THEN
          CREATE TYPE enum_orders_payment_method AS ENUM (
            'card', 'upi', 'netbanking', 'wallet', 'cod', 'bank_transfer'
          );
        END IF;
      END $$;
    `);

    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      outlet_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "outlets",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      address_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "addresses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      order_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "out_for_delivery",
          "delivered",
          "cancelled",
          "refunded"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      order_type: {
        type: Sequelize.ENUM("delivery", "pickup"),
        allowNull: false,
        defaultValue: "delivery",
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      delivery_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM(
          "pending",
          "paid",
          "failed",
          "refunded",
          "partially_refunded"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      payment_method: {
        type: Sequelize.ENUM("cash", "card", "upi", "wallet", "netbanking"),
        allowNull: true,
      },
      estimated_delivery_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actual_delivery_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      special_instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancellation_reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
    await queryInterface.addIndex("orders", ["status"]);
    await queryInterface.addIndex("orders", ["order_number"]);
    await queryInterface.addIndex("orders", ["created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("orders");
  },
};
