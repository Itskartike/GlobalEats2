"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "owner_id" UUID
        REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE SET NULL;
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "brands_owner_id" ON "brands" ("owner_id");
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("brands", "owner_id");
  },
};
