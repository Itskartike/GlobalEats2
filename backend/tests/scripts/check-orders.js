const { sequelize } = require("./src/database/config/database");

async function checkOrdersTable() {
  try {
    // Check the current table structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position;
    `);

    console.log("Orders table structure:");
    console.table(results);
  } catch (error) {
    console.error("Error checking orders table:", error.message);
  } finally {
    await sequelize.close();
  }
}

checkOrdersTable();
