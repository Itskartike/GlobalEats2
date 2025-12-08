const { sequelize } = require("./database");

const cleanDatabase = async () => {
  try {
    console.log("🧹 Cleaning database...");

    // Get all table names
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    // Drop all tables with CASCADE to handle foreign keys
    for (const table of tables) {
      console.log(`Dropping table: ${table.tablename}`);
      await sequelize.query(
        `DROP TABLE IF EXISTS "${table.tablename}" CASCADE`
      );
    }

    // Also drop any remaining sequences, indexes, etc.
    const [sequences] = await sequelize.query(`
      SELECT sequencename 
      FROM pg_sequences 
      WHERE schemaname = 'public'
    `);

    for (const seq of sequences) {
      console.log(`Dropping sequence: ${seq.sequencename}`);
      await sequelize.query(
        `DROP SEQUENCE IF EXISTS "${seq.sequencename}" CASCADE`
      );
    }

    // Drop custom types (ENUMs)
    const [types] = await sequelize.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND typtype = 'e'
    `);

    for (const type of types) {
      console.log(`Dropping type: ${type.typname}`);
      await sequelize.query(`DROP TYPE IF EXISTS "${type.typname}" CASCADE`);
    }

    console.log("✅ Database cleaned successfully!");
  } catch (error) {
    console.error("❌ Database cleaning failed:", error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  cleanDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { cleanDatabase };
