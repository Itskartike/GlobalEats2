const { sequelize } = require("./src/database/config/database");

async function checkSchema() {
  try {
    // Check existing users table structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log("=== OLD users table schema ===");
    console.table(results);

    // Check new Users table structure
    const [newResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log("\n=== NEW Users table schema ===");
    console.table(newResults);

    // Check data in old table
    const [userData] = await sequelize.query("SELECT * FROM users LIMIT 5");
    console.log("\n=== Sample data in old users table ===");
    console.table(userData);
  } catch (error) {
    console.error("Error checking schema:", error.message);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
