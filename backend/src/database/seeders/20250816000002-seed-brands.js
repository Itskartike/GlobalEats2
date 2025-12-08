"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("brands", [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        name: "McDonald's",
        slug: "mcdonalds",
        description: "World famous burgers and fries",
        logo_url:
          "https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=200",
        banner_url:
          "https://images.pexels.com/photos/580612/pexels-photo-580612.jpeg?auto=compress&cs=tinysrgb&w=800",
        cuisine_type: "Fast Food",
        average_rating: 4.2,
        total_reviews: 1250,
        is_active: true,
        is_featured: true,
        minimum_order_amount: 99.0,
        delivery_fee: 49.0,
        estimated_delivery_time: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        name: "Pizza Hut",
        slug: "pizza-hut",
        description: "Americas favorite pizza restaurant",
        logo_url:
          "https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=200",
        banner_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800",
        cuisine_type: "Pizza",
        average_rating: 4.0,
        total_reviews: 980,
        is_active: true,
        is_featured: true,
        minimum_order_amount: 199.0,
        delivery_fee: 39.0,
        estimated_delivery_time: 35,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        name: "Domino's",
        slug: "dominos",
        description: "The pizza delivery experts",
        logo_url:
          "https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=200",
        banner_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800",
        cuisine_type: "Pizza",
        average_rating: 4.3,
        total_reviews: 1456,
        is_active: true,
        is_featured: true,
        minimum_order_amount: 159.0,
        delivery_fee: 29.0,
        estimated_delivery_time: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("brands", null, {});
  },
};
