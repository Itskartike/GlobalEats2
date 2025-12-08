const fs = require("fs");
const path = require("path");
const { sequelize } = require("../src/database/config/database");

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, "migrations");
  }

  async runMigrations() {
    console.log("🚀 Starting database migrations...");

    try {
      // Ensure database connection
      await sequelize.authenticate();
      console.log("✅ Database connection established");

      // Get all migration files
      const migrationFiles = fs
        .readdirSync(this.migrationsPath)
        .filter((file) => file.endsWith(".sql"))
        .sort();

      if (migrationFiles.length === 0) {
        console.log("📝 No migration files found");
        return;
      }

      // Run each migration
      for (const file of migrationFiles) {
        console.log(`📄 Running migration: ${file}`);
        const migrationPath = path.join(this.migrationsPath, file);
        const migrationSQL = fs.readFileSync(migrationPath, "utf8");

        try {
          await sequelize.query(migrationSQL);
          console.log(`✅ Migration ${file} completed successfully`);
        } catch (error) {
          console.error(`❌ Migration ${file} failed:`, error.message);
          throw error;
        }
      }

      console.log("🎉 All migrations completed successfully!");
    } catch (error) {
      console.error("💥 Migration failed:", error);
      throw error;
    }
  }

  async rollbackMigrations() {
    console.log("⏪ Rolling back migrations...");

    try {
      // Drop all tables in reverse order
      const tables = [
        "outlet_menu_items",
        "brand_categories",
        "menu_items",
        "outlets",
        "brands",
        "categories",
      ];

      for (const table of tables) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
          console.log(`✅ Dropped table: ${table}`);
        } catch (error) {
          console.warn(`⚠️ Could not drop table ${table}:`, error.message);
        }
      }

      console.log("🎉 Rollback completed!");
    } catch (error) {
      console.error("💥 Rollback failed:", error);
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const runner = new MigrationRunner();
  const command = process.argv[2];

  switch (command) {
    case "up":
      runner
        .runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    case "down":
      runner
        .rollbackMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;

    default:
      console.log("Usage: node migrationRunner.js [up|down]");
      console.log("  up   - Run all pending migrations");
      console.log("  down - Rollback all migrations");
      process.exit(1);
  }
}

module.exports = MigrationRunner;
