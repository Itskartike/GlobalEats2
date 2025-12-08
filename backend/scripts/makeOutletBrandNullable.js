const { sequelize } = require("../src/database/config/database");

async function run() {
  console.log("Making outlets.brand_id nullable (and SET NULL on delete)...");
  try {
    // Drop existing FK to change nullability safely
    await sequelize.query(`
      DO $$
      DECLARE
        fk_name text;
      BEGIN
        SELECT tc.constraint_name INTO fk_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'outlets' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'brand_id'
        LIMIT 1;
        IF fk_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE outlets DROP CONSTRAINT %I', fk_name);
        END IF;
      END $$;
    `);

    // Alter column nullability
    await sequelize.query(`ALTER TABLE outlets ALTER COLUMN brand_id DROP NOT NULL;`);

    // Recreate FK with SET NULL
    await sequelize.query(`
      ALTER TABLE outlets
      ADD CONSTRAINT fk_outlets_brand_id FOREIGN KEY (brand_id)
      REFERENCES brands(id) ON UPDATE CASCADE ON DELETE SET NULL;
    `);

    console.log("✅ outlets.brand_id is now nullable with ON DELETE SET NULL");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to update outlets.brand_id:", err.message);
    process.exit(1);
  }
}

run();


