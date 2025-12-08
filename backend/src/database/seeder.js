const { sequelize } = require("./config/database");
const {
  Brand,
  Outlet,
  Category,
  BrandMenuItem,
  OutletMenuItem,
  BrandCategory,
  User,
} = require("../models/associations");
const seedData = require("./seedDataNew");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await sequelize.sync({ force: true });
    console.log("✅ Database tables recreated");

    // Seed Users
    console.log("👥 Seeding users...");
    await User.bulkCreate(seedData.users);
    console.log(`✅ Created ${seedData.users.length} users`);

    // Seed Categories
    console.log("📂 Seeding categories...");
    await Category.bulkCreate(seedData.categories);
    console.log(`✅ Created ${seedData.categories.length} categories`);

    // Seed Brands
    console.log("🏪 Seeding brands...");
    await Brand.bulkCreate(seedData.brands);
    console.log(`✅ Created ${seedData.brands.length} brands`);

    // Seed Outlets
    console.log("🏢 Seeding outlets...");
    await Outlet.bulkCreate(seedData.outlets);
    console.log(`✅ Created ${seedData.outlets.length} outlets`);

    // Seed Menu Items
    console.log("🍔 Seeding menu items...");
    await BrandMenuItem.bulkCreate(seedData.menuItems);
    console.log(`✅ Created ${seedData.menuItems.length} menu items`);

    // Seed Outlet Menu Items (connects menu items to specific outlets)
    console.log("🔗 Seeding outlet menu items...");
    await OutletMenuItem.bulkCreate(seedData.outletMenuItems);
    console.log(
      `✅ Created ${seedData.outletMenuItems.length} outlet menu items`
    );

    // Brand Categories can be added later as needed
    // console.log('🔗 Seeding brand categories...');
    // await BrandCategory.bulkCreate(seedData.brandCategories);
    // console.log(`✅ Created ${seedData.brandCategories.length} brand categories`);

    console.log("🎉 Database seeding completed successfully!");

    // Print user credentials for testing
    console.log("\n📧 Test User Credentials:");
    console.log("Email: john@example.com");
    console.log("Password: password123");
    console.log("\nEmail: jane@example.com");
    console.log("Password: password123");
    console.log("\nAdmin Email: admin@globaleats.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

module.exports = { seedDatabase };

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
