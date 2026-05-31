"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Skip if table already exists (e.g. created by sequelize.sync())
    const [rows] = await queryInterface.sequelize.query(
      `SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='payments' LIMIT 1;`
    );
    if (rows.length > 0) return;

    // Drop any orphaned Sequelize-generated ENUM types from a crashed partial run
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_payments_payment_method";
      DROP TYPE IF EXISTS "enum_payments_status";
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
        type: Sequelize.ENUM("cash", "cod", "card", "upi", "wallet", "netbanking"),
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
