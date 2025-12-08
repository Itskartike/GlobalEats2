"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("menu_items", [
      // McDonald's Items
      {
        id: "1111aaaa-1111-1111-1111-111111111111",
        brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's
        category_id: "11111111-1111-1111-1111-111111111111", // Burgers
        name: "Big Mac",
        description:
          "Two all-beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun",
        image_url:
          "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
        base_price: 299.0,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 0,
        calories: 540,
        preparation_time: 8,
        is_available: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2222aaaa-2222-2222-2222-222222222222",
        brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's
        category_id: "11111111-1111-1111-1111-111111111111", // Burgers
        name: "McChicken",
        description:
          "Crispy chicken breast patty with lettuce and mayo on a sesame seed bun",
        image_url:
          "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
        base_price: 199.0,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 1,
        calories: 400,
        preparation_time: 6,
        is_available: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3333aaaa-3333-3333-3333-333333333333",
        brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's
        category_id: "11111111-1111-1111-1111-111111111111", // Burgers
        name: "Quarter Pounder",
        description: "Quarter pound of 100% fresh beef cooked when you order",
        image_url:
          "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
        base_price: 349.0,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 0,
        calories: 520,
        preparation_time: 10,
        is_available: true,
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4444aaaa-4444-4444-4444-444444444444",
        brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's
        category_id: "11111111-1111-1111-1111-111111111111", // Burgers
        name: "McVeggie",
        description: "Delicious veggie patty with fresh vegetables",
        image_url:
          "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
        base_price: 179.0,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 1,
        calories: 320,
        preparation_time: 6,
        is_available: true,
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "5555aaaa-5555-5555-5555-555555555555",
        brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's
        category_id: "33333333-3333-3333-3333-333333333333", // Beverages
        name: "Coca-Cola",
        description: "Classic Coca-Cola soft drink",
        image_url:
          "https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg",
        base_price: 89.0,
        is_vegetarian: true,
        is_vegan: true,
        is_gluten_free: true,
        spice_level: 0,
        calories: 140,
        preparation_time: 1,
        is_available: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "6666aaaa-6666-6666-6666-666666666666",
        brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's
        category_id: "11111111-1111-1111-1111-111111111111", // Burgers (French Fries as side)
        name: "French Fries",
        description: "World famous golden fries",
        image_url:
          "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
        base_price: 119.0,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 0,
        calories: 340,
        preparation_time: 4,
        is_available: true,
        sort_order: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Pizza Hut Items
      {
        id: "1111bbbb-1111-1111-1111-111111111111",
        brand_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Pizza Hut
        category_id: "22222222-2222-2222-2222-222222222222", // Pizza
        name: "Margherita Pizza",
        description:
          "Classic pizza with tomato sauce, mozzarella cheese and fresh basil",
        image_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        base_price: 399.0,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 0,
        calories: 280,
        preparation_time: 15,
        is_available: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2222bbbb-2222-2222-2222-222222222222",
        brand_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Pizza Hut
        category_id: "22222222-2222-2222-2222-222222222222", // Pizza
        name: "Pepperoni Pizza",
        description: "Pizza topped with pepperoni and mozzarella cheese",
        image_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        base_price: 499.0,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 1,
        calories: 320,
        preparation_time: 15,
        is_available: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3333bbbb-3333-3333-3333-333333333333",
        brand_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Pizza Hut
        category_id: "22222222-2222-2222-2222-222222222222", // Pizza
        name: "Veggie Paradise",
        description:
          "Fresh vegetables with corn, capsicum, onions, and tomatoes",
        image_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        base_price: 449.0,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 1,
        calories: 290,
        preparation_time: 16,
        is_available: true,
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4444bbbb-4444-4444-4444-444444444444",
        brand_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Pizza Hut
        category_id: "33333333-3333-3333-3333-333333333333", // Beverages
        name: "Pepsi",
        description: "Chilled Pepsi cola",
        image_url:
          "https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg",
        base_price: 79.0,
        is_vegetarian: true,
        is_vegan: true,
        is_gluten_free: true,
        spice_level: 0,
        calories: 150,
        preparation_time: 2,
        is_available: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Domino's Items
      {
        id: "1111cccc-1111-1111-1111-111111111111",
        brand_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", // Domino's
        category_id: "22222222-2222-2222-2222-222222222222", // Pizza
        name: "Farmhouse Pizza",
        description:
          "Delightful combination of onion, capsicum, tomato & grilled mushroom",
        image_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        base_price: 479.0,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 1,
        calories: 320,
        preparation_time: 15,
        is_available: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2222cccc-2222-2222-2222-222222222222",
        brand_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", // Domino's
        category_id: "22222222-2222-2222-2222-222222222222", // Pizza
        name: "Chicken Dominator",
        description:
          "Loaded with grilled chicken tikka, chicken keema, and chicken sausage",
        image_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        base_price: 649.0,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 3,
        calories: 450,
        preparation_time: 18,
        is_available: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "3333cccc-3333-3333-3333-333333333333",
        brand_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", // Domino's
        category_id: "22222222-2222-2222-2222-222222222222", // Pizza
        name: "Mexican Green Wave",
        description:
          "Mexican herbs sprinkled on onion, capsicum, tomato & jalapeno",
        image_url:
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        base_price: 459.0,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        spice_level: 2,
        calories: 310,
        preparation_time: 14,
        is_available: true,
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "4444cccc-4444-4444-4444-444444444444",
        brand_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", // Domino's
        category_id: "33333333-3333-3333-3333-333333333333", // Beverages
        name: "Domino's Lemonade",
        description: "Fresh lemon drink",
        image_url:
          "https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg",
        base_price: 99.0,
        is_vegetarian: true,
        is_vegan: true,
        is_gluten_free: true,
        spice_level: 0,
        calories: 80,
        preparation_time: 3,
        is_available: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "5555cccc-5555-5555-5555-555555555555",
        brand_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", // Domino's
        category_id: "33333333-3333-3333-3333-333333333333", // Beverages
        name: "Sprite",
        description: "Lemon lime flavored soft drink",
        image_url:
          "https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg",
        base_price: 85.0,
        is_vegetarian: true,
        is_vegan: true,
        is_gluten_free: true,
        spice_level: 0,
        calories: 145,
        preparation_time: 2,
        is_available: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("menu_items", null, {});
  },
};
