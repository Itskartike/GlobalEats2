"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // We add 'cod' to both ENUM types if it doesn't already exist.
    // PostgreSQL requires catching the duplicate object exception if it exists via an exception block,
    // or we can just run the ALTER TYPE outside a transaction with a check.
    
    // Add to enum_orders_payment_method
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE enum_orders_payment_method ADD VALUE 'cod';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add to enum_payments_method (defined in create-payments.js raw query)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE enum_payments_method ADD VALUE 'cod';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add to enum_payments_payment_method (Sequelize auto-generated type from createTable)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE enum_payments_payment_method ADD VALUE 'cod';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null; -- If this type doesn't exist, ignore
      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL doesn't support dropping a single ENUM value easily.
    // We'd have to recreate the entire ENUM type, which is risky in a down migration.
    // Easiest is to do nothing, as having extra enum values is harmless.
  },
};
