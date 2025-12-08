const {
  Brand,
  Outlet,
  Category,
  BrandMenuItem,
  OutletMenuItem,
  BrandCategory,
} = require("../models/associations");

class BrandOutletSeeder {
  async run() {
    console.log("🌱 Starting Brand-Outlet System Seeder...");

    try {
      // 1. Create Categories
      await this.createCategories();

      // 2. Create Brands
      await this.createBrands();

      // 3. Create Outlets
      await this.createOutlets();

      // 4. Create Menu Items
      await this.createMenuItems();

      // 5. Link Brand Categories
      await this.linkBrandCategories();

      // 6. Create Outlet Menu Items
      await this.createOutletMenuItems();

      console.log("✅ Brand-Outlet System Seeder completed successfully!");
    } catch (error) {
      console.error("❌ Seeder failed:", error);
      throw error;
    }
  }

  async createCategories() {
    console.log("📝 Creating categories...");

    const categories = [
      {
        name: "Pizza",
        description: "Delicious pizzas with various toppings",
        image_url:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
        sort_order: 1,
      },
      {
        name: "Burgers",
        description: "Juicy burgers and sandwiches",
        image_url:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        sort_order: 2,
      },
      {
        name: "Indian",
        description: "Authentic Indian cuisine",
        image_url:
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
        sort_order: 3,
      },
      {
        name: "Chinese",
        description: "Traditional and Indo-Chinese dishes",
        image_url:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43",
        sort_order: 4,
      },
      {
        name: "South Indian",
        description: "Dosas, Idlis, and South Indian delicacies",
        image_url:
          "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
        sort_order: 5,
      },
      {
        name: "Desserts",
        description: "Sweet treats and desserts",
        image_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307",
        sort_order: 6,
      },
      {
        name: "Beverages",
        description: "Refreshing drinks and beverages",
        image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e",
        sort_order: 7,
      },
    ];

    await Category.bulkCreate(categories);
    console.log(`✅ Created ${categories.length} categories`);
  }

  async createBrands() {
    console.log("🏢 Creating brands...");

    const brands = [
      {
        name: "Domino's Pizza",
        slug: "dominos-pizza",
        description: "World's largest pizza delivery company",
        logo_url: "https://cdn.worldvectorlogo.com/logos/dominos-5.svg",
        banner_url:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591",
        cuisine_type: "Pizza",
        average_rating: 4.2,
        total_reviews: 15420,
        is_featured: true,
        minimum_order_amount: 199.0,
        delivery_fee: 29.0,
        estimated_delivery_time: 30,
      },
      {
        name: "McDonald's",
        slug: "mcdonalds",
        description: "I'm Lovin' It - World famous burgers and fries",
        logo_url: "https://cdn.worldvectorlogo.com/logos/mcdonalds-15.svg",
        banner_url:
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add",
        cuisine_type: "Burgers",
        average_rating: 4.1,
        total_reviews: 8965,
        is_featured: true,
        minimum_order_amount: 149.0,
        delivery_fee: 39.0,
        estimated_delivery_time: 25,
      },
      {
        name: "Haldiram's",
        slug: "haldirams",
        description: "Traditional Indian sweets and snacks",
        logo_url: "https://cdn.worldvectorlogo.com/logos/haldirams.svg",
        banner_url:
          "https://images.unsplash.com/photo-1606491956689-2ea866880c84",
        cuisine_type: "Indian",
        average_rating: 4.3,
        total_reviews: 12340,
        is_featured: true,
        minimum_order_amount: 99.0,
        delivery_fee: 19.0,
        estimated_delivery_time: 40,
      },
      {
        name: "Wow! Momo",
        slug: "wow-momo",
        description: "Delicious momos and Chinese fast food",
        logo_url: "https://cdn.worldvectorlogo.com/logos/wow-momo.svg",
        banner_url:
          "https://images.unsplash.com/photo-1496116218417-1a781b1c416c",
        cuisine_type: "Chinese",
        average_rating: 4.0,
        total_reviews: 6780,
        is_featured: false,
        minimum_order_amount: 129.0,
        delivery_fee: 25.0,
        estimated_delivery_time: 35,
      },
      {
        name: "Sagar Ratna",
        slug: "sagar-ratna",
        description: "Authentic South Indian cuisine",
        logo_url: "https://cdn.worldvectorlogo.com/logos/sagar-ratna.svg",
        banner_url:
          "https://images.unsplash.com/photo-1630383249896-424e482df921",
        cuisine_type: "South Indian",
        average_rating: 4.4,
        total_reviews: 9876,
        is_featured: true,
        minimum_order_amount: 89.0,
        delivery_fee: 15.0,
        estimated_delivery_time: 45,
      },
      {
        name: "Baskin Robbins",
        slug: "baskin-robbins",
        description: "31 flavors of premium ice cream",
        logo_url: "https://cdn.worldvectorlogo.com/logos/baskin-robbins-1.svg",
        banner_url:
          "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f",
        cuisine_type: "Desserts",
        average_rating: 4.5,
        total_reviews: 5432,
        is_featured: false,
        minimum_order_amount: 79.0,
        delivery_fee: 29.0,
        estimated_delivery_time: 20,
      },
    ];

    await Brand.bulkCreate(brands);
    console.log(`✅ Created ${brands.length} brands`);
  }

  async createOutlets() {
    console.log("🏪 Creating outlets...");

    const outlets = [
      // Domino's outlets
      {
        brand_id: 1,
        name: "Domino's Connaught Place",
        address: "F-8, Connaught Place, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110001",
        latitude: 28.6315,
        longitude: 77.2167,
        phone: "+91-11-23412345",
        delivery_radius: 5.0,
      },
      {
        brand_id: 1,
        name: "Domino's Karol Bagh",
        address: "45, Ajmal Khan Road, Karol Bagh, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110005",
        latitude: 28.6519,
        longitude: 77.1909,
        phone: "+91-11-25412345",
        delivery_radius: 4.5,
      },
      // McDonald's outlets
      {
        brand_id: 2,
        name: "McDonald's Select City Walk",
        address: "Select City Walk Mall, Saket, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110017",
        latitude: 28.5245,
        longitude: 77.2066,
        phone: "+91-11-26512345",
        delivery_radius: 6.0,
      },
      {
        brand_id: 2,
        name: "McDonald's CP",
        address: "N Block, Connaught Place, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110001",
        latitude: 28.6304,
        longitude: 77.2177,
        phone: "+91-11-23512345",
        delivery_radius: 5.5,
      },
      // Haldiram's outlets
      {
        brand_id: 3,
        name: "Haldiram's Chandni Chowk",
        address: "1454, Chandni Chowk, Old Delhi",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110006",
        latitude: 28.6506,
        longitude: 77.2334,
        phone: "+91-11-23612345",
        delivery_radius: 3.0,
      },
      // Add more outlets for other brands...
      {
        brand_id: 4,
        name: "Wow! Momo Lajpat Nagar",
        address: "Central Market, Lajpat Nagar, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110024",
        latitude: 28.5677,
        longitude: 77.2434,
        phone: "+91-11-26712345",
        delivery_radius: 4.0,
      },
      {
        brand_id: 5,
        name: "Sagar Ratna Defence Colony",
        address: "Defence Colony Market, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110024",
        latitude: 28.5729,
        longitude: 77.2295,
        phone: "+91-11-24612345",
        delivery_radius: 5.0,
      },
      {
        brand_id: 6,
        name: "Baskin Robbins Khan Market",
        address: "Khan Market, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        postal_code: "110003",
        latitude: 28.5988,
        longitude: 77.2295,
        phone: "+91-11-24812345",
        delivery_radius: 4.0,
      },
    ];

    await Outlet.bulkCreate(outlets);
    console.log(`✅ Created ${outlets.length} outlets`);
  }

  async createMenuItems() {
    console.log("🍽️ Creating menu items...");

    const menuItems = [
      // Domino's menu items
      {
        brand_id: 1,
        category_id: 1,
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella and basil",
        image_url:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3",
        base_price: 299.0,
        is_vegetarian: true,
        preparation_time: 20,
        sort_order: 1,
      },
      {
        brand_id: 1,
        category_id: 1,
        name: "Pepperoni Pizza",
        description: "Spicy pepperoni with mozzarella cheese",
        image_url:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e",
        base_price: 449.0,
        is_vegetarian: false,
        preparation_time: 22,
        sort_order: 2,
      },
      {
        brand_id: 1,
        category_id: 1,
        name: "Veggie Supreme",
        description: "Loaded with fresh vegetables and cheese",
        image_url:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
        base_price: 399.0,
        is_vegetarian: true,
        preparation_time: 25,
        sort_order: 3,
      },
      // McDonald's menu items
      {
        brand_id: 2,
        category_id: 2,
        name: "Big Mac",
        description: "Two beef patties, special sauce, lettuce, cheese",
        image_url:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        base_price: 189.0,
        is_vegetarian: false,
        preparation_time: 8,
        sort_order: 1,
      },
      {
        brand_id: 2,
        category_id: 2,
        name: "McVeggie Burger",
        description: "Vegetarian burger with fresh lettuce and mayo",
        image_url:
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add",
        base_price: 149.0,
        is_vegetarian: true,
        preparation_time: 6,
        sort_order: 2,
      },
      {
        brand_id: 2,
        category_id: 7,
        name: "French Fries",
        description: "Golden crispy potato fries",
        image_url:
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
        base_price: 99.0,
        is_vegetarian: true,
        preparation_time: 5,
        sort_order: 3,
      },
      // Add more menu items for other brands...
    ];

    await BrandMenuItem.bulkCreate(menuItems);
    console.log(`✅ Created ${menuItems.length} menu items`);
  }

  async linkBrandCategories() {
    console.log("🔗 Linking brands with categories...");

    const brandCategories = [
      { brand_id: 1, category_id: 1 }, // Domino's - Pizza
      { brand_id: 2, category_id: 2 }, // McDonald's - Burgers
      { brand_id: 2, category_id: 7 }, // McDonald's - Beverages
      { brand_id: 3, category_id: 3 }, // Haldiram's - Indian
      { brand_id: 3, category_id: 6 }, // Haldiram's - Desserts
      { brand_id: 4, category_id: 4 }, // Wow Momo - Chinese
      { brand_id: 5, category_id: 5 }, // Sagar Ratna - South Indian
      { brand_id: 6, category_id: 6 }, // Baskin Robbins - Desserts
    ];

    await BrandCategory.bulkCreate(brandCategories);
    console.log(`✅ Created ${brandCategories.length} brand-category links`);
  }

  async createOutletMenuItems() {
    console.log("📋 Creating outlet menu item availability...");

    // For simplicity, make all menu items available at all outlets of their respective brands
    const brands = await Brand.findAll({ include: ["outlets", "menuItems"] });

    const outletMenuItems = [];

    for (const brand of brands) {
      for (const outlet of brand.outlets) {
        for (const menuItem of brand.menuItems) {
          outletMenuItems.push({
            outlet_id: outlet.id,
            menu_item_id: menuItem.id,
            is_available: true,
            // outlet_price can be different from base_price if needed
          });
        }
      }
    }

    if (outletMenuItems.length > 0) {
      await OutletMenuItem.bulkCreate(outletMenuItems);
      console.log(
        `✅ Created ${outletMenuItems.length} outlet menu item links`
      );
    }
  }
}

module.exports = BrandOutletSeeder;
