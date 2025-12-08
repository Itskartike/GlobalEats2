const fs = require("fs");
const path = require("path");
const { sequelize } = require("./database");
const { Sequelize } = require("sequelize");

const runMigrations = async () => {
  try {
    console.log("🔄 Running database migrations...");

    const migrationsDir = path.join(__dirname, "../migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".js"))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));
      await migration.up(sequelize.getQueryInterface(), Sequelize);
      console.log(`✅ Completed migration: ${file}`);
    }

    console.log("✅ All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

const runSeeders = async () => {
  try {
    console.log("🔄 Running database seeders...");

    const seedersDir = path.join(__dirname, "../seeders");
    const seederFiles = fs
      .readdirSync(seedersDir)
      .filter((file) => file.endsWith(".js"))
      .sort();

    for (const file of seederFiles) {
      console.log(`Running seeder: ${file}`);
      const seeder = require(path.join(seedersDir, file));

      // Check if it's a Sequelize-style seeder with up method
      if (typeof seeder.up === "function") {
        await seeder.up(sequelize.getQueryInterface(), Sequelize);
      } else {
        // Handle data-style seeders
        const tableName = file.replace(/^\d+-/, "").replace(".js", "");
        const dataKey = Object.keys(seeder).find(
          (key) => key !== "ids" && Array.isArray(seeder[key])
        );

        if (dataKey && seeder[dataKey]) {
          console.log(
            `  Inserting ${seeder[dataKey].length} records into ${tableName}`
          );
          await sequelize
            .getQueryInterface()
            .bulkInsert(tableName, seeder[dataKey]);
        }
      }

      console.log(`✅ Completed seeder: ${file}`);
    }

    console.log("✅ All seeders completed successfully!");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    throw error;
  }
};

const setupDatabase = async () => {
  try {
    await runMigrations();
    await runSeeders();
    console.log("🎉 Database setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = {
  runMigrations,
  runSeeders,
  setupDatabase,
};
