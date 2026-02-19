"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // PostgreSQL: Add new ENUM values first, then migrate data, then remove old values
    // Step 1: Add new values to the ENUM
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'vendor';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'delivery_agent';`
    );

    // Step 2: Migrate existing data
    await queryInterface.sequelize.query(
      `UPDATE "users" SET "role" = 'vendor' WHERE "role" = 'restaurant';`
    );
    await queryInterface.sequelize.query(
      `UPDATE "users" SET "role" = 'delivery_agent' WHERE "role" = 'delivery';`
    );

    // Step 3: Recreate the ENUM type without old values
    // We need to: create a new type, swap the column, drop the old type
    // Drop if exists from partial previous run
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_role_new";
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role_new" AS ENUM('customer', 'vendor', 'admin', 'delivery_agent');
    `);
    // Must drop default before changing enum type in PostgreSQL
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE "enum_users_role_new" USING "role"::text::"enum_users_role_new";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_role";
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role_new" RENAME TO "enum_users_role";
    `);
    // Restore default
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer'::"enum_users_role";
    `);
  },

  async down(queryInterface, Sequelize) {
    // Reverse: add old values, migrate data back, remove new values
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'restaurant';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'delivery';`
    );

    await queryInterface.sequelize.query(
      `UPDATE "users" SET "role" = 'restaurant' WHERE "role" = 'vendor';`
    );
    await queryInterface.sequelize.query(
      `UPDATE "users" SET "role" = 'delivery' WHERE "role" = 'delivery_agent';`
    );

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role_old" AS ENUM('customer', 'admin', 'restaurant', 'delivery');
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE "enum_users_role_old" USING "role"::text::"enum_users_role_old";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_users_role";
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role_old" RENAME TO "enum_users_role";
    `);
  },
};
