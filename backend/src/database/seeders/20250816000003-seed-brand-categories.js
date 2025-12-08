"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("brand_categories", [
      // McDonald's - Burgers & Beverages
      {
        id: "11aa1111-1111-1111-1111-111111111111",
        brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's
        category_id: "11111111-1111-1111-1111-111111111111", // Burgers
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "11aa3333-3333-3333-3333-333333333333",
        brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's
        category_id: "33333333-3333-3333-3333-333333333333", // Beverages
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Pizza Hut - Pizza & Beverages
      {
        id: "22bb2222-2222-2222-2222-222222222222",
        brand_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Pizza Hut
        category_id: "22222222-2222-2222-2222-222222222222", // Pizza
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "22bb3333-3333-3333-3333-333333333333",
        brand_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Pizza Hut
        category_id: "33333333-3333-3333-3333-333333333333", // Beverages
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Domino's - Pizza & Beverages
      {
        id: "33cc2222-2222-2222-2222-222222222222",
        brand_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", // Domino's
        category_id: "22222222-2222-2222-2222-222222222222", // Pizza
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "33cc3333-3333-3333-3333-333333333333",
        brand_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", // Domino's
        category_id: "33333333-3333-3333-3333-333333333333", // Beverages
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("brand_categories", null, {});
  },
};
