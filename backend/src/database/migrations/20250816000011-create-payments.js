"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUMs first - check if they don't already exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_payments_status') THEN
          CREATE TYPE enum_payments_status AS ENUM (
            'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
          );
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_payments_method') THEN
          CREATE TYPE enum_payments_method AS ENUM (
            'card', 'upi', 'netbanking', 'wallet', 'cod', 'bank_transfer'
          );
        END IF;
      END $$;
    `);

    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      payment_method: {
        type: Sequelize.ENUM("cash", "card", "upi", "wallet", "netbanking"),
        allowNull: false,
      },
      payment_provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "e.g., Razorpay, Stripe, PayU",
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      gateway_transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "INR",
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "processing",
          "success",
          "failed",
          "cancelled",
          "refunded",
          "partially_refunded"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      gateway_response: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Raw response from payment gateway",
      },
      failure_reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      refund_reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      processed_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex("payments", ["status"]);
    await queryInterface.addIndex("payments", ["created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payments");
  },
};
