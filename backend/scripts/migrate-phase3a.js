const { sequelize } = require("../src/database/config/database");
const fs = require("fs");
const path = require("path");

async function runPhase3AMigration() {
  try {
    console.log("🚀 Starting Phase 3A Migration: Multi-Brand Outlets...");
    
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, "../migrations/phase3a_multi_brand_outlets.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    console.log(`📋 Executing migration...`);
    
    await sequelize.transaction(async (transaction) => {
      // Execute the entire SQL content as one block
      await sequelize.query(migrationSQL, { transaction });
    });
    
    console.log("✅ Phase 3A Migration completed successfully!");
    
    // Verify the migration
    await verifyMigration();
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

async function verifyMigration() {
  try {
    console.log("\n🔍 Verifying migration results...");
    
    // Check outlet_brands table exists and has data
    const [outletBrandsCount] = await sequelize.query(
      "SELECT COUNT(*) as count FROM outlet_brands"
    );
    console.log(`   outlet_brands table: ${outletBrandsCount[0].count} relationships created`);
    
    // Check outlet_menu_items has pricing columns
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'outlet_menu_items' 
      AND column_name IN ('price', 'discount_percentage', 'is_available', 'preparation_time')
    `);
    console.log(`   outlet_menu_items enhanced with ${columns.length}/4 pricing columns`);
    
    // Check orders has outlet_id and brand_id
    const [orderColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name IN ('outlet_id', 'brand_id')
    `);
    console.log(`   orders table enhanced with ${orderColumns.length}/2 assignment columns`);
    
    console.log("✅ Migration verification completed!");
    
  } catch (error) {
    console.error("❌ Migration verification failed:", error);
  }
}

async function seedOutletBrandData() {
  try {
    console.log("\n🌱 Seeding sample outlet-brand relationships...");
    
    // Create additional brand-outlet relationships for testing
    const sampleRelationships = [
      // McDonald's outlet in Indiranagar can also serve Subway and Pizza Hut
      { outletName: "McDonald's - Indiranagar", brandNames: ["Pizza Hut", "Domino's"] },
      // Pizza Hut outlet in Koramangala can also serve Domino's and McDonald's  
      { outletName: "Pizza Hut - Koramangala", brandNames: ["Grabs", "Domino's"] },
      // Domino's outlet in Jayanagar can also serve McDonald's and Pizza Hut
      { outletName: "Domino's - Jayanagar", brandNames: ["Grabs", "Pizza Hut"] }
    ];
    
    for (const relationship of sampleRelationships) {
      // Find outlet by name
      const [outletResults] = await sequelize.query(`
        SELECT id FROM outlets WHERE name LIKE '%${relationship.outletName}%' LIMIT 1
      `);
      
      if (outletResults.length > 0) {
        const outletId = outletResults[0].id;
        
        for (const brandName of relationship.brandNames) {
          // Find brand by name
          const [brandResults] = await sequelize.query(`
            SELECT id FROM brands WHERE name = '${brandName}' LIMIT 1
          `);
          
          if (brandResults.length > 0) {
            const brandId = brandResults[0].id;
            
            // Insert outlet-brand relationship
            await sequelize.query(`
              INSERT INTO outlet_brands (outlet_id, brand_id, is_available, preparation_time, minimum_order_amount, delivery_fee, priority)
              VALUES ('${outletId}', '${brandId}', true, 25, 150, 30, 2)
              ON CONFLICT (outlet_id, brand_id) DO NOTHING
            `);
            
            console.log(`   ✓ Added ${brandName} to ${relationship.outletName}`);
          }
        }
      }
    }
    
    console.log("✅ Sample data seeding completed!");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

// Main execution
async function main() {
  try {
    await runPhase3AMigration();
    await seedOutletBrandData();
    
    console.log("\n🎉 Phase 3A Database Setup Complete!");
    console.log("   → Multi-brand outlets are now supported");
    console.log("   → Outlet-specific pricing is available");
    console.log("   → Order assignment to outlets is ready");
    
    process.exit(0);
  } catch (error) {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runPhase3AMigration, verifyMigration, seedOutletBrandData };
