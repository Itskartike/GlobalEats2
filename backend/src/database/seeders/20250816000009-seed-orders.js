const { v4: uuidv4 } = require("uuid");

// Fixed UUIDs for consistent seeding
const orderIds = {
  order1: "22222222-3333-4444-5555-666666666666",
  order2: "22222222-3333-4444-5555-666666666667",
  order3: "22222222-3333-4444-5555-666666666668",
  order4: "22222222-3333-4444-5555-666666666669",
  order5: "22222222-3333-4444-5555-66666666666a",
};

// Import IDs from other seeders
const userIds = {
  john: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  jane: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
  admin: "ffffffff-ffff-ffff-ffff-ffffffffffff",
};

const outletIds = {
  mcdonalds_indiranagar: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
  pizzahut_koramangala: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
  dominos_jayanagar: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
};

const addressIds = {
  john_home: "11111111-2222-3333-4444-555555555555",
  john_work: "11111111-2222-3333-4444-555555555556",
  jane_home: "11111111-2222-3333-4444-555555555557",
  jane_work: "11111111-2222-3333-4444-555555555558",
};

const orders = [
  {
    id: orderIds.order1,
    user_id: userIds.john,
    outlet_id: outletIds.mcdonalds_indiranagar,
    address_id: addressIds.john_home,
    order_number: "GE2025001",
    status: "delivered",
    order_type: "delivery",
    subtotal: 518.0,
    tax_amount: 52.0,
    delivery_fee: 49.0,
    discount_amount: 50.0,
    total_amount: 569.0,
    payment_status: "paid",
    payment_method: "upi",
    estimated_delivery_time: new Date(Date.now() - 86400000), // 1 day ago
    actual_delivery_time: new Date(Date.now() - 86400000 + 1800000), // 1 day ago + 30 minutes
    special_instructions: "No onions please",
    created_at: new Date(Date.now() - 86400000), // 1 day ago
    updated_at: new Date(Date.now() - 86400000 + 1800000),
  },
  {
    id: orderIds.order2,
    user_id: userIds.jane,
    outlet_id: outletIds.pizzahut_koramangala,
    address_id: addressIds.jane_home,
    order_number: "GE2025002",
    status: "delivered",
    order_type: "delivery",
    subtotal: 899.0,
    tax_amount: 90.0,
    delivery_fee: 39.0,
    discount_amount: 0.0,
    total_amount: 1028.0,
    payment_status: "paid",
    payment_method: "card",
    estimated_delivery_time: new Date(Date.now() - 43200000), // 12 hours ago
    actual_delivery_time: new Date(Date.now() - 43200000 + 2700000), // 12 hours ago + 45 minutes
    special_instructions: "Extra cheese on pizza",
    created_at: new Date(Date.now() - 43200000), // 12 hours ago
    updated_at: new Date(Date.now() - 43200000 + 2700000),
  },
  {
    id: orderIds.order3,
    user_id: userIds.john,
    outlet_id: outletIds.dominos_jayanagar,
    address_id: addressIds.john_work,
    order_number: "GE2025003",
    status: "out_for_delivery",
    order_type: "delivery",
    subtotal: 759.0,
    tax_amount: 76.0,
    delivery_fee: 49.0,
    discount_amount: 75.0,
    total_amount: 809.0,
    payment_status: "paid",
    payment_method: "wallet",
    estimated_delivery_time: new Date(Date.now() + 1200000), // 20 minutes from now
    actual_delivery_time: null,
    special_instructions: "Call when you reach the gate",
    created_at: new Date(Date.now() - 3600000), // 1 hour ago
    updated_at: new Date(Date.now() - 600000), // 10 minutes ago
  },
  {
    id: orderIds.order4,
    user_id: userIds.jane,
    outlet_id: outletIds.mcdonalds_indiranagar,
    address_id: addressIds.jane_work,
    order_number: "GE2025004",
    status: "preparing",
    order_type: "delivery",
    subtotal: 398.0,
    tax_amount: 40.0,
    delivery_fee: 49.0,
    discount_amount: 0.0,
    total_amount: 487.0,
    payment_status: "paid",
    payment_method: "upi",
    estimated_delivery_time: new Date(Date.now() + 1800000), // 30 minutes from now
    actual_delivery_time: null,
    special_instructions: "Make it spicy",
    created_at: new Date(Date.now() - 900000), // 15 minutes ago
    updated_at: new Date(Date.now() - 300000), // 5 minutes ago
  },
  {
    id: orderIds.order5,
    user_id: userIds.john,
    outlet_id: outletIds.pizzahut_koramangala,
    address_id: addressIds.john_home,
    order_number: "GE2025005",
    status: "cancelled",
    order_type: "delivery",
    subtotal: 649.0,
    tax_amount: 65.0,
    delivery_fee: 49.0,
    discount_amount: 0.0,
    total_amount: 763.0,
    payment_status: "refunded",
    payment_method: "card",
    estimated_delivery_time: null,
    actual_delivery_time: null,
    special_instructions: null,
    cancellation_reason: "Customer requested cancellation",
    created_at: new Date(Date.now() - 7200000), // 2 hours ago
    updated_at: new Date(Date.now() - 6600000), // 1 hour 50 minutes ago
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("orders", orders);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("orders", null, {});
  },
};
