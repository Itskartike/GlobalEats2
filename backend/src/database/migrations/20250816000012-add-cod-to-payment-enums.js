"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // All ENUM types below are recreated fresh by createTable with 'cod' already included.
    // These ALTER TYPE calls are safe no-ops — they handle both duplicate_object
    // (value already exists) and undefined_object (type doesn't exist at all).

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE enum_orders_payment_method ADD VALUE 'cod';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE enum_payments_method ADD VALUE 'cod';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE enum_payments_payment_method ADD VALUE 'cod';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null;
      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL doesn't support dropping a single ENUM value easily — no-op.
  },
};
