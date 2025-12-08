const { v4: uuidv4 } = require("uuid");

// Fixed UUIDs for consistent seeding
const ratingIds = {
  rating1: "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
  rating2: "77777777-8888-9999-aaaa-bbbbbbbbbbbc",
  rating3: "77777777-8888-9999-aaaa-bbbbbbbbbbbd",
};

// Import IDs from other seeders
const userIds = {
  john: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  jane: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
  admin: "ffffffff-ffff-ffff-ffff-ffffffffffff",
};

const orderIds = {
  order1: "22222222-3333-4444-5555-666666666666",
  order2: "22222222-3333-4444-5555-666666666667",
  order3: "22222222-3333-4444-5555-666666666668",
  order4: "22222222-3333-4444-5555-666666666669",
  order5: "22222222-3333-4444-5555-66666666666a",
};

const outletIds = {
  mcdonalds_indiranagar: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
  pizzahut_koramangala: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
  dominos_jayanagar: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
};

const ratings = [
  {
    id: ratingIds.rating1,
    user_id: userIds.john,
    order_id: orderIds.order1,
    outlet_id: outletIds.mcdonalds_indiranagar,
    rating: 4.5,
    review_text:
      "Great food quality and fast delivery! The Big Mac was fresh and hot. Only minor complaint is that they forgot the extra sauce I requested, but overall excellent experience.",
    food_rating: 4.5,
    delivery_rating: 4.0,
    service_rating: 4.5,
    is_anonymous: false,
    is_verified: true,
    is_featured: true,
    helpful_count: 12,
    reported_count: 0,
    status: "active",
    created_at: new Date(Date.now() - 82800000), // 23 hours ago
    updated_at: new Date(Date.now() - 82800000),
  },
  {
    id: ratingIds.rating2,
    user_id: userIds.jane,
    order_id: orderIds.order2,
    outlet_id: outletIds.pizzahut_koramangala,
    rating: 5.0,
    review_text:
      "Absolutely fantastic! The pizza arrived hot and was exactly what I ordered. Extra cheese was perfect and the delivery was on time. Pizza Hut never disappoints!",
    food_rating: 5.0,
    delivery_rating: 5.0,
    service_rating: 4.5,
    is_anonymous: false,
    is_verified: true,
    is_featured: false,
    helpful_count: 8,
    reported_count: 0,
    status: "active",
    created_at: new Date(Date.now() - 39600000), // 11 hours ago
    updated_at: new Date(Date.now() - 39600000),
  },
  {
    id: ratingIds.rating3,
    user_id: userIds.john,
    order_id: orderIds.order3,
    outlet_id: outletIds.dominos_jayanagar,
    rating: 3.5,
    review_text:
      "Food was good but delivery took longer than expected. The burgers were still warm but the fries were a bit soggy. Staff was polite when I called to check on the order.",
    food_rating: 3.5,
    delivery_rating: 3.0,
    service_rating: 4.0,
    is_anonymous: true,
    is_verified: true,
    is_featured: false,
    helpful_count: 5,
    reported_count: 0,
    status: "active",
    created_at: new Date(Date.now() - 25200000), // 7 hours ago
    updated_at: new Date(Date.now() - 25200000),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("ratings", ratings);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ratings", null, {});
  },
};
