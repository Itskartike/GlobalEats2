const { sequelize } = require("./src/database/config/database");

async function checkAddressesTable() {
  try {
    // Check if table exists and get its structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'addresses' 
      ORDER BY ordinal_position;
    `);

    console.log("Addresses table structure:");
    console.table(results);

    // Check if there's data in the table
    const [count] = await sequelize.query(
      "SELECT COUNT(*) as count FROM addresses;"
    );
    console.log(`\nRows in addresses table: ${count[0].count}`);
  } catch (error) {
    console.error("Error checking addresses table:", error.message);
  } finally {
    await sequelize.close();
  }
}

checkAddressesTable();
