const { v4: uuidv4 } = require("uuid");

// Fixed UUIDs for consistent seeding
const orderItemIds = {
  item1: "33333333-4444-5555-6666-777777777777",
  item2: "33333333-4444-5555-6666-777777777778",
  item3: "33333333-4444-5555-6666-777777777779",
  item4: "33333333-4444-5555-6666-77777777777a",
  item5: "33333333-4444-5555-6666-77777777777b",
  item6: "33333333-4444-5555-6666-77777777777c",
  item7: "33333333-4444-5555-6666-77777777777d",
  item8: "33333333-4444-5555-6666-77777777777e",
  item9: "33333333-4444-5555-6666-77777777777f",
  item10: "33333333-4444-5555-6666-777777777780",
  item11: "33333333-4444-5555-6666-777777777781",
  item12: "33333333-4444-5555-6666-777777777782",
};

// Import IDs from other seeders
const orderIds = {
  order1: "22222222-3333-4444-5555-666666666666",
  order2: "22222222-3333-4444-5555-666666666667",
  order3: "22222222-3333-4444-5555-666666666668",
  order4: "22222222-3333-4444-5555-666666666669",
  order5: "22222222-3333-4444-5555-66666666666a",
};

const menuItemIds = {
  // McDonald's items
  mcdonalds_bigmac: "1111aaaa-1111-1111-1111-111111111111",
  mcdonalds_mcchicken: "2222aaaa-2222-2222-2222-222222222222",
  mcdonalds_quarterpounder: "3333aaaa-3333-3333-3333-333333333333",
  mcdonalds_mcveggie: "4444aaaa-4444-4444-4444-444444444444",
  mcdonalds_coke: "5555aaaa-5555-5555-5555-555555555555",
  mcdonalds_fries: "6666aaaa-6666-6666-6666-666666666666",
  // Pizza Hut items
  pizzahut_margherita: "1111bbbb-1111-1111-1111-111111111111",
  pizzahut_pepperoni: "2222bbbb-2222-2222-2222-222222222222",
  pizzahut_veggie: "3333bbbb-3333-3333-3333-333333333333",
  pizzahut_pepsi: "4444bbbb-4444-4444-4444-444444444444",
  // Domino's items
  dominos_farmhouse: "1111cccc-1111-1111-1111-111111111111",
  dominos_chicken: "2222cccc-2222-2222-2222-222222222222",
  dominos_veg: "3333cccc-3333-3333-3333-333333333333",
  dominos_lemonade: "4444cccc-4444-4444-4444-444444444444",
  dominos_sprite: "5555cccc-5555-5555-5555-555555555555",
};

const orderItems = [
  // Order 1 - McDonald's (John)
  {
    id: orderItemIds.item1,
    order_id: orderIds.order1,
    menu_item_id: menuItemIds.mcdonalds_bigmac,
    quantity: 2,
    unit_price: 299.0,
    total_price: 598.0,
    special_instructions: "No onions",
    created_at: new Date(Date.now() - 86400000),
    updated_at: new Date(Date.now() - 86400000),
  },
  {
    id: orderItemIds.item2,
    order_id: orderIds.order1,
    menu_item_id: menuItemIds.mcdonalds_coke,
    quantity: 2,
    unit_price: 89.0,
    total_price: 178.0,
    special_instructions: "No ice",
    created_at: new Date(Date.now() - 86400000),
    updated_at: new Date(Date.now() - 86400000),
  },

  // Order 2 - Pizza Hut (Jane)
  {
    id: orderItemIds.item3,
    order_id: orderIds.order2,
    menu_item_id: menuItemIds.pizzahut_margherita,
    quantity: 1,
    unit_price: 399.0,
    total_price: 399.0,
    special_instructions: "Extra cheese",
    created_at: new Date(Date.now() - 43200000),
    updated_at: new Date(Date.now() - 43200000),
  },
  {
    id: orderItemIds.item4,
    order_id: orderIds.order2,
    menu_item_id: menuItemIds.pizzahut_pepperoni,
    quantity: 1,
    unit_price: 499.0,
    total_price: 499.0,
    special_instructions: "Thin crust",
    created_at: new Date(Date.now() - 43200000),
    updated_at: new Date(Date.now() - 43200000),
  },
  {
    id: orderItemIds.item5,
    order_id: orderIds.order2,
    menu_item_id: menuItemIds.pizzahut_pepsi,
    quantity: 1,
    unit_price: 79.0,
    total_price: 79.0,
    special_instructions: null,
    created_at: new Date(Date.now() - 43200000),
    updated_at: new Date(Date.now() - 43200000),
  },

  // Order 3 - Domino's (John)
  {
    id: orderItemIds.item6,
    order_id: orderIds.order3,
    menu_item_id: menuItemIds.dominos_chicken,
    quantity: 1,
    unit_price: 549.0,
    total_price: 549.0,
    special_instructions: "Extra spicy",
    created_at: new Date(Date.now() - 3600000),
    updated_at: new Date(Date.now() - 3600000),
  },
  {
    id: orderItemIds.item7,
    order_id: orderIds.order3,
    menu_item_id: menuItemIds.dominos_veg,
    quantity: 1,
    unit_price: 449.0,
    total_price: 449.0,
    special_instructions: "No capsicum",
    created_at: new Date(Date.now() - 3600000),
    updated_at: new Date(Date.now() - 3600000),
  },
  {
    id: orderItemIds.item8,
    order_id: orderIds.order3,
    menu_item_id: menuItemIds.dominos_lemonade,
    quantity: 2,
    unit_price: 99.0,
    total_price: 198.0,
    special_instructions: null,
    created_at: new Date(Date.now() - 3600000),
    updated_at: new Date(Date.now() - 3600000),
  },

  // Order 4 - McDonald's (Jane)
  {
    id: orderItemIds.item9,
    order_id: orderIds.order4,
    menu_item_id: menuItemIds.mcdonalds_mcchicken,
    quantity: 1,
    unit_price: 199.0,
    total_price: 199.0,
    special_instructions: "Extra mayo",
    created_at: new Date(Date.now() - 900000),
    updated_at: new Date(Date.now() - 900000),
  },
  {
    id: orderItemIds.item10,
    order_id: orderIds.order4,
    menu_item_id: menuItemIds.mcdonalds_mcveggie,
    quantity: 1,
    unit_price: 179.0,
    total_price: 179.0,
    special_instructions: "Make it spicy",
    created_at: new Date(Date.now() - 900000),
    updated_at: new Date(Date.now() - 900000),
  },
  {
    id: orderItemIds.item11,
    order_id: orderIds.order4,
    menu_item_id: menuItemIds.mcdonalds_fries,
    quantity: 1,
    unit_price: 119.0,
    total_price: 119.0,
    special_instructions: "Extra salt",
    created_at: new Date(Date.now() - 900000),
    updated_at: new Date(Date.now() - 900000),
  },

  // Order 5 - Pizza Hut (Cancelled - John)
  {
    id: orderItemIds.item12,
    order_id: orderIds.order5,
    menu_item_id: menuItemIds.pizzahut_veggie,
    quantity: 1,
    unit_price: 459.0,
    total_price: 459.0,
    special_instructions: "No olives",
    created_at: new Date(Date.now() - 7200000),
    updated_at: new Date(Date.now() - 7200000),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("order_items", orderItems);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("order_items", null, {});
  },
};
