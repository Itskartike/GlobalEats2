const { sequelize } = require("./config/database");
const fs = require("fs");
const path = require("path");

async function ensureMigrationsTable() {
  const qi = sequelize.getQueryInterface();
  // Create a tracking table if it doesn't exist
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "_migrations" (
      name VARCHAR(255) PRIMARY KEY,
      run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Backfill: if the DB has tables but no migration records, mark all existing migrations as done
  const [migrationCount] = await sequelize.query(
    `SELECT COUNT(*) as cnt FROM "_migrations";`
  );
  if (parseInt(migrationCount[0].cnt) === 0) {
    // Check if the DB already has real tables (meaning migrations were already applied)
    const [tables] = await sequelize.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_migrations';`
    );
    if (tables.length > 0) {
      console.log(
        "📋 Backfilling migration tracking table for existing DB..."
      );
      const migrationsDir = path.join(__dirname, "migrations");
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".js"))
        .sort();
      for (const file of migrationFiles) {
        await recordMigration(file);
      }
      console.log(
        `✅ Marked ${migrationFiles.length} existing migrations as applied`
      );
    }
  }
}

async function getCompletedMigrations() {
  const [results] = await sequelize.query(
    `SELECT name FROM "_migrations" ORDER BY name;`
  );
  return new Set(results.map((r) => r.name));
}

async function recordMigration(name) {
  await sequelize.query(
    `INSERT INTO "_migrations" (name) VALUES (:name) ON CONFLICT DO NOTHING;`,
    { replacements: { name } }
  );
}

async function runMigrations() {
  try {
    console.log("🔄 Running database migrations...");

    await ensureMigrationsTable();
    const completed = await getCompletedMigrations();

    // Get all migration files in order
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".js"))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    let ran = 0;
    // Run each migration
    for (const file of migrationFiles) {
      if (completed.has(file)) {
        console.log(`⏭️  Skipping already-applied migration: ${file}`);
        continue;
      }

      console.log(`📄 Running migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));

      if (migration.up) {
        await migration.up(
          sequelize.getQueryInterface(),
          sequelize.constructor
        );
        await recordMigration(file);
        ran++;
        console.log(`✅ Migration ${file} completed`);
      } else {
        console.warn(`⚠️  Migration ${file} has no 'up' method`);
      }
    }

    console.log(
      ran > 0
        ? `✅ ${ran} migration(s) applied successfully`
        : "✅ Database is up to date — no new migrations"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
}

async function runSeeders() {
  try {
    console.log("🌱 Running database seeders...");

    // Get all seeder files in a specific order
    const seedersDir = path.join(__dirname, "seeders");
    const seederFiles = [
      "20250816000001-seed-categories.js",
      "20250816000002-seed-brands.js",
      "20250816000003-seed-brand-categories.js",
      "20250816000004-seed-outlets.js",
      "20250816000005-seed-menu-items.js",
      "20250816000006-seed-outlet-menu-items.js",
      "20250816000007-seed-users.js",
      "20250816000008-seed-addresses.js",
      "20250816000009-seed-orders.js",
      "20250816000010-seed-order-items.js",
      "20250816000011-seed-payments.js",
      "20250816000012-seed-ratings.js",
    ];

    console.log(`Found ${seederFiles.length} seeder files`);

    // Run each seeder
    for (const file of seederFiles) {
      console.log(`🌱 Running seeder: ${file}`);
      const seeder = require(path.join(seedersDir, file));

      if (seeder.up) {
        // Migration-style seeder
        await seeder.up(sequelize.getQueryInterface(), sequelize.constructor);
        console.log(`✅ Seeder ${file} completed`);
      } else if (
        seeder.addresses ||
        seeder.orders ||
        seeder.orderItems ||
        seeder.payments ||
        seeder.ratings
      ) {
        // Plain data export seeder - determine which data to seed
        const fileName = file.replace(".js", "");
        if (seeder.addresses) {
          await sequelize
            .getQueryInterface()
            .bulkInsert("addresses", seeder.addresses);
          console.log(
            `✅ Seeded ${seeder.addresses.length} addresses from ${file}`
          );
        }
        if (seeder.orders) {
          await sequelize
            .getQueryInterface()
            .bulkInsert("orders", seeder.orders);
          console.log(`✅ Seeded ${seeder.orders.length} orders from ${file}`);
        }
        if (seeder.orderItems) {
          await sequelize
            .getQueryInterface()
            .bulkInsert("order_items", seeder.orderItems);
          console.log(
            `✅ Seeded ${seeder.orderItems.length} order items from ${file}`
          );
        }
        if (seeder.payments) {
          await sequelize
            .getQueryInterface()
            .bulkInsert("payments", seeder.payments);
          console.log(
            `✅ Seeded ${seeder.payments.length} payments from ${file}`
          );
        }
        if (seeder.ratings) {
          await sequelize
            .getQueryInterface()
            .bulkInsert("ratings", seeder.ratings);
          console.log(
            `✅ Seeded ${seeder.ratings.length} ratings from ${file}`
          );
        }
      } else {
        console.warn(
          `⚠️  Seeder ${file} has no recognized data or 'up' method`
        );
      }
    }

    console.log("✅ All seeders completed successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    throw error;
  }
}

async function resetDatabase() {
  try {
    console.log("🔄 Resetting database...");

    // Drop all tables (in reverse dependency order)
    const tables = [
      "ratings",
      "payments",
      "order_items",
      "orders",
      "addresses",
      "outlet_menu_items",
      "menu_items",
      "outlets",
      "brand_categories",
      "brands",
      "categories",
      "users",
    ];

    for (const table of tables) {
      try {
        await sequelize.getQueryInterface().dropTable(table, { cascade: true });
        console.log(`🗑️  Dropped table: ${table}`);
      } catch (error) {
        // Table might not exist, continue
        console.log(`ℹ️  Table ${table} doesn't exist, skipping...`);
      }
    }

    console.log("✅ Database reset completed");
  } catch (error) {
    console.error("❌ Database reset failed:", error.message);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    console.log("🚀 Initializing database...");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Reset database (optional - comment out if you want to keep existing data)
    // await resetDatabase();

    // Run migrations
    await runMigrations();

    // Run seeders
    await runSeeders();

    console.log("🎉 Database initialization completed successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    process.exit(1);
  }
}

// Command line interface
const command = process.argv[2];

async function main() {
  switch (command) {
    case "migrate":
      await runMigrations();
      break;
    case "seed":
      await runSeeders();
      break;
    case "reset":
      await resetDatabase();
      break;
    case "init":
    default:
      await initializeDatabase();
      break;
  }

  await sequelize.close();
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runMigrations,
  runSeeders,
  resetDatabase,
  initializeDatabase,
};
