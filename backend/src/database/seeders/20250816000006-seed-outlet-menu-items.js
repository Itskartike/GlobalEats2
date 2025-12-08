"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("outlet_menu_items", [
      // McDonald's Indiranagar
      {
        id: "111111aa-1111-1111-1111-111111111111",
        outlet_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", // McDonald's Indiranagar
        menu_item_id: "1111aaaa-1111-1111-1111-111111111111", // Big Mac
        outlet_price: 299.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "222222aa-2222-2222-2222-222222222222",
        outlet_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", // McDonald's Indiranagar
        menu_item_id: "2222aaaa-2222-2222-2222-222222222222", // McChicken
        outlet_price: 199.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "333333aa-3333-3333-3333-333333333333",
        outlet_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", // McDonald's Indiranagar
        menu_item_id: "3333aaaa-3333-3333-3333-333333333333", // Quarter Pounder
        outlet_price: 349.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "444444aa-4444-4444-4444-444444444444",
        outlet_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", // McDonald's Indiranagar
        menu_item_id: "4444aaaa-4444-4444-4444-444444444444", // McVeggie
        outlet_price: 179.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "555555aa-5555-5555-5555-555555555555",
        outlet_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", // McDonald's Indiranagar
        menu_item_id: "5555aaaa-5555-5555-5555-555555555555", // Coca-Cola
        outlet_price: 89.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "666666aa-6666-6666-6666-666666666666",
        outlet_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", // McDonald's Indiranagar
        menu_item_id: "6666aaaa-6666-6666-6666-666666666666", // French Fries
        outlet_price: 119.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Pizza Hut Koramangala
      {
        id: "1111bbbb-1111-1111-1111-111111111111",
        outlet_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", // Pizza Hut Koramangala
        menu_item_id: "1111bbbb-1111-1111-1111-111111111111", // Margherita
        outlet_price: 399.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2222bbbb-2222-2222-2222-222222222222",
        outlet_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", // Pizza Hut Koramangala
        menu_item_id: "2222bbbb-2222-2222-2222-222222222222", // Pepperoni
        outlet_price: 499.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3333bbbb-3333-3333-3333-333333333333",
        outlet_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", // Pizza Hut Koramangala
        menu_item_id: "3333bbbb-3333-3333-3333-333333333333", // Veggie Paradise
        outlet_price: 449.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4444bbbb-4444-4444-4444-444444444444",
        outlet_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", // Pizza Hut Koramangala
        menu_item_id: "4444bbbb-4444-4444-4444-444444444444", // Pepsi
        outlet_price: 79.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Domino's Jayanagar
      {
        id: "1111eeee-1111-1111-1111-111111111111",
        outlet_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", // Domino's Jayanagar
        menu_item_id: "1111cccc-1111-1111-1111-111111111111", // Farmhouse
        outlet_price: 479.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2222eeee-2222-2222-2222-222222222222",
        outlet_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", // Domino's Jayanagar
        menu_item_id: "2222cccc-2222-2222-2222-222222222222", // Chicken Dominator
        outlet_price: 649.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3333eeee-3333-3333-3333-333333333333",
        outlet_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", // Domino's Jayanagar
        menu_item_id: "3333cccc-3333-3333-3333-333333333333", // Mexican Green Wave
        outlet_price: 459.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4444eeee-4444-4444-4444-444444444444",
        outlet_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", // Domino's Jayanagar
        menu_item_id: "4444cccc-4444-4444-4444-444444444444", // Lemonade
        outlet_price: 99.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "5555eeee-5555-5555-5555-555555555555",
        outlet_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3", // Domino's Jayanagar
        menu_item_id: "5555cccc-5555-5555-5555-555555555555", // Sprite
        outlet_price: 85.0,
        is_available: true,
        stock_quantity: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("outlet_menu_items", null, {});
  },
};
