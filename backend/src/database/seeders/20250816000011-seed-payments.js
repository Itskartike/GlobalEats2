const { v4: uuidv4 } = require("uuid");

// Fixed UUIDs for consistent seeding
const paymentIds = {
  payment1: "55555555-6666-7777-8888-999999999999",
  payment2: "55555555-6666-7777-8888-99999999999a",
  payment3: "55555555-6666-7777-8888-99999999999b",
  payment4: "55555555-6666-7777-8888-99999999999c",
  payment5: "55555555-6666-7777-8888-99999999999d",
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

const payments = [
  {
    id: paymentIds.payment1,
    order_id: orderIds.order1,
    user_id: userIds.john,
    payment_method: "upi",
    payment_provider: "Razorpay",
    transaction_id: "TXN2025001",
    gateway_transaction_id: "rzp_live_1234567890",
    amount: 569.0,
    currency: "INR",
    status: "completed",
    gateway_response: JSON.stringify({
      id: "rzp_live_1234567890",
      amount: 56900,
      currency: "INR",
      status: "captured",
      method: "upi",
      vpa: "john@paytm",
    }),
    failure_reason: null,
    refund_amount: 0.0,
    refund_reason: null,
    processed_at: new Date(Date.now() - 86400000 + 300000), // 1 day ago + 5 minutes
    created_at: new Date(Date.now() - 86400000),
    updated_at: new Date(Date.now() - 86400000 + 300000),
  },
  {
    id: paymentIds.payment2,
    order_id: orderIds.order2,
    user_id: userIds.jane,
    payment_method: "card",
    payment_provider: "Razorpay",
    transaction_id: "TXN2025002",
    gateway_transaction_id: "rzp_live_2345678901",
    amount: 1028.0,
    currency: "INR",
    status: "completed",
    gateway_response: JSON.stringify({
      id: "rzp_live_2345678901",
      amount: 102800,
      currency: "INR",
      status: "captured",
      method: "card",
      card: {
        last4: "1234",
        network: "Visa",
      },
    }),
    failure_reason: null,
    refund_amount: 0.0,
    refund_reason: null,
    processed_at: new Date(Date.now() - 43200000 + 180000), // 12 hours ago + 3 minutes
    created_at: new Date(Date.now() - 43200000),
    updated_at: new Date(Date.now() - 43200000 + 180000),
  },
  {
    id: paymentIds.payment3,
    order_id: orderIds.order3,
    user_id: userIds.john,
    payment_method: "wallet",
    payment_provider: "Paytm",
    transaction_id: "TXN2025003",
    gateway_transaction_id: "paytm_3456789012",
    amount: 809.0,
    currency: "INR",
    status: "completed",
    gateway_response: JSON.stringify({
      TXNID: "paytm_3456789012",
      TXNAMOUNT: "809.00",
      STATUS: "TXN_SUCCESS",
      PAYMENTMODE: "PPI",
    }),
    failure_reason: null,
    refund_amount: 0.0,
    refund_reason: null,
    processed_at: new Date(Date.now() - 3600000 + 120000), // 1 hour ago + 2 minutes
    created_at: new Date(Date.now() - 3600000),
    updated_at: new Date(Date.now() - 3600000 + 120000),
  },
  {
    id: paymentIds.payment4,
    order_id: orderIds.order4,
    user_id: userIds.jane,
    payment_method: "upi",
    payment_provider: "PhonePe",
    transaction_id: "TXN2025004",
    gateway_transaction_id: "phonepe_4567890123",
    amount: 487.0,
    currency: "INR",
    status: "completed",
    gateway_response: JSON.stringify({
      transactionId: "phonepe_4567890123",
      amount: 48700,
      state: "COMPLETED",
      paymentInstrument: {
        type: "UPI",
        vpa: "jane@phonepe",
      },
    }),
    failure_reason: null,
    refund_amount: 0.0,
    refund_reason: null,
    processed_at: new Date(Date.now() - 900000 + 60000), // 15 minutes ago + 1 minute
    created_at: new Date(Date.now() - 900000),
    updated_at: new Date(Date.now() - 900000 + 60000),
  },
  {
    id: paymentIds.payment5,
    order_id: orderIds.order5,
    user_id: userIds.john,
    payment_method: "card",
    payment_provider: "Razorpay",
    transaction_id: "TXN2025005",
    gateway_transaction_id: "rzp_live_5678901234",
    amount: 763.0,
    currency: "INR",
    status: "refunded",
    gateway_response: JSON.stringify({
      id: "rzp_live_5678901234",
      amount: 76300,
      currency: "INR",
      status: "refunded",
      method: "card",
      refund: {
        id: "rfnd_live_9876543210",
        amount: 76300,
        currency: "INR",
        status: "processed",
      },
    }),
    failure_reason: null,
    refund_amount: 763.0,
    refund_reason: "Customer requested cancellation",
    processed_at: new Date(Date.now() - 7200000 + 300000), // 2 hours ago + 5 minutes
    created_at: new Date(Date.now() - 7200000),
    updated_at: new Date(Date.now() - 6600000), // 1 hour 50 minutes ago (refund time)
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("payments", payments);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("payments", null, {});
  },
};
