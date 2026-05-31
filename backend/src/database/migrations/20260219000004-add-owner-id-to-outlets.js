"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "outlets" ADD COLUMN IF NOT EXISTS "owner_id" UUID
        REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE SET NULL;
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "outlets_owner_id" ON "outlets" ("owner_id");
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("outlets", "owner_id");
  },
};
