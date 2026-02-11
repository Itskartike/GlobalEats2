const { sequelize } = require("./src/database/config/database");

async function cleanupDuplicateTables() {
  try {
    // Drop the new duplicate tables that are interfering
    console.log("Dropping duplicate tables...");

    await sequelize.query('DROP TABLE IF EXISTS "Users" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Addresses" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Restaurants" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Orders" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "OrderItems" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "MenuItems" CASCADE;');

    console.log("✅ Duplicate tables dropped successfully");

    // Check remaining tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log("\n=== Remaining tables ===");
    console.table(tables);
  } catch (error) {
    console.error("Error cleaning up tables:", error.message);
  } finally {
    await sequelize.close();
  }
}

cleanupDuplicateTables();
