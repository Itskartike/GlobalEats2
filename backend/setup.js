const MigrationRunner = require("./database/migrationRunner");
const BrandOutletSeeder = require("./src/seeders/BrandOutletSeeder");
const { sequelize } = require("./src/database/config/database");

class SetupScript {
  async run() {
    console.log("🚀 Starting GlobalEats Phase 2 Setup...\n");

    try {
      // 1. Test database connection
      console.log("1️⃣ Testing database connection...");
      await sequelize.authenticate();
      console.log("✅ Database connected successfully\n");

      // 2. Run migrations
      console.log("2️⃣ Running database migrations...");
      const migrationRunner = new MigrationRunner();
      await migrationRunner.runMigrations();
      console.log("✅ Migrations completed\n");

      // 3. Sync models (create any additional constraints)
      console.log("3️⃣ Syncing Sequelize models...");
      await sequelize.sync({ alter: true });
      console.log("✅ Models synced\n");

      // 4. Run seeders
      console.log("4️⃣ Running database seeders...");
      const seeder = new BrandOutletSeeder();
      await seeder.run();
      console.log("✅ Seeders completed\n");

      // 5. Verify setup
      console.log("5️⃣ Verifying setup...");
      await this.verifySetup();
      console.log("✅ Setup verification completed\n");

      console.log("🎉 Phase 2 setup completed successfully!");
      console.log("🔗 You can now test the API endpoints:");
      console.log("   GET /api/brands - List all brands");
      console.log("   GET /api/brands/dominos-pizza - Get brand details");
      console.log(
        "   GET /api/brands/1/outlets/nearby?latitude=28.6315&longitude=77.2167"
      );
    } catch (error) {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    } finally {
      await sequelize.close();
    }
  }

  async verifySetup() {
    const {
      Brand,
      Outlet,
      Category,
      BrandMenuItem,
      OutletMenuItem,
      BrandCategory,
    } = require("./src/models/associations");

    try {
      const counts = {
        brands: await Brand.count(),
        outlets: await Outlet.count(),
        categories: await Category.count(),
        menuItems: await BrandMenuItem.count(),
        outletMenuItems: await OutletMenuItem.count(),
        brandCategories: await BrandCategory.count(),
      };

      console.log("📊 Database counts:");
      Object.entries(counts).forEach(([table, count]) => {
        console.log(`   ${table}: ${count} records`);
      });

      // Test a complex query
      const brandsWithOutlets = await Brand.findAll({
        include: ["outlets", "categories"],
        limit: 1,
      });

      if (brandsWithOutlets.length > 0) {
        console.log("✅ Complex queries working correctly");
      } else {
        throw new Error("No brands found with outlets");
      }
    } catch (error) {
      console.error("❌ Verification failed:", error);
      throw error;
    }
  }

  async reset() {
    console.log("🔄 Resetting database...\n");

    try {
      // Drop all tables
      const migrationRunner = new MigrationRunner();
      await migrationRunner.rollbackMigrations();

      // Re-run setup
      await this.run();
    } catch (error) {
      console.error("💥 Reset failed:", error);
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const setup = new SetupScript();
  const command = process.argv[2];

  switch (command) {
    case "install":
    case "setup":
      setup.run();
      break;

    case "reset":
      setup.reset();
      break;

    default:
      console.log("Usage: node setup.js [setup|reset]");
      console.log("  setup - Run complete Phase 2 setup");
      console.log("  reset - Reset database and re-run setup");
      setup.run(); // Default to setup
  }
}

module.exports = SetupScript;
