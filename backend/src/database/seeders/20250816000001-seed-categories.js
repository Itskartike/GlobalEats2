"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("categories", [
      {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Burgers",
        description: "Delicious burgers and sandwiches",
        image_url:
          "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Pizza",
        description: "Fresh pizzas with authentic flavors",
        image_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Beverages",
        description: "Refreshing drinks and beverages",
        image_url:
          "https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg",
        is_active: true,
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        name: "Indian",
        description: "Authentic Indian cuisine",
        image_url:
          "https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg",
        is_active: true,
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
