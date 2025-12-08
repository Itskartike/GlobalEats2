const { v4: uuidv4 } = require("uuid");

// Fixed UUIDs for consistent seeding
const addressIds = {
  john_home: "11111111-2222-3333-4444-555555555555",
  john_work: "11111111-2222-3333-4444-555555555556",
  jane_home: "11111111-2222-3333-4444-555555555557",
  jane_work: "11111111-2222-3333-4444-555555555558",
};

// User IDs from users seeder
const userIds = {
  john: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  jane: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
  admin: "ffffffff-ffff-ffff-ffff-ffffffffffff",
};

const addresses = [
  {
    id: addressIds.john_home,
    user_id: userIds.john,
    address_type: "home",
    label: "Home",
    recipient_name: "John Doe",
    phone: "+91-9876543210",
    street_address: "A-123, Green Park Society",
    apartment: "Near Metro Station",
    landmark: "Opposite SBI Bank",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110016",
    country: "India",
    latitude: 28.5494,
    longitude: 77.205,
    is_default: true,
    is_active: true,
    instructions: "Ring the bell twice. Flat on 2nd floor.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: addressIds.john_work,
    user_id: userIds.john,
    address_type: "work",
    label: "Office",
    recipient_name: "John Doe",
    phone: "+91-9876543210",
    street_address: "Tower B, Cyber City",
    apartment: "DLF Phase 2",
    landmark: "Near Food Court",
    city: "Gurgaon",
    state: "Haryana",
    pincode: "122002",
    country: "India",
    latitude: 28.494,
    longitude: 77.089,
    is_default: false,
    is_active: true,
    instructions: "Call before delivery. Security gate requires ID.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: addressIds.jane_home,
    user_id: userIds.jane,
    address_type: "home",
    label: "Home",
    recipient_name: "Jane Smith",
    phone: "+91-9876543211",
    street_address: "B-456, Lajpat Nagar",
    apartment: "Central Market Area",
    landmark: "Near Central Market",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110024",
    country: "India",
    latitude: 28.5677,
    longitude: 77.2425,
    is_default: true,
    is_active: true,
    instructions: "Ground floor. Gate is usually open.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: addressIds.jane_work,
    user_id: userIds.jane,
    address_type: "work",
    label: "Office",
    recipient_name: "Jane Smith",
    phone: "+91-9876543211",
    street_address: "Connaught Place",
    apartment: "Block A, 3rd Floor",
    landmark: "Near Palika Bazaar",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    country: "India",
    latitude: 28.6315,
    longitude: 77.2167,
    is_default: false,
    is_active: true,
    instructions: "Reception will collect. Mention Jane Smith.",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("addresses", addresses);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("addresses", null, {});
  },
};
