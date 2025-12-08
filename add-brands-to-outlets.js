// Script to add multiple brands to outlets
// Run this file with: node add-brands-to-outlets.js

const { Sequelize } = require("sequelize");
const path = require("path");

// Load environment variables from backend
require("dotenv").config({ path: path.join(__dirname, "backend", ".env") });

// Database configuration from environment variables
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // Set to console.log to see SQL queries
  }
);

async function addBrandsToOutlets() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Step 1: Get all outlets and brands
    console.log("\n📍 Available Outlets:");
    const [outlets] = await sequelize.query(
      "SELECT id, name FROM outlets ORDER BY name"
    );
    outlets.forEach((outlet, index) => {
      console.log(`${index + 1}. ${outlet.name} (ID: ${outlet.id})`);
    });

    console.log("\n🏪 Available Brands:");
    const [brands] = await sequelize.query(
      "SELECT id, name FROM brands ORDER BY name"
    );
    brands.forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name} (ID: ${brand.id})`);
    });

    // Step 2: Define which brands to add to which outlets
    // CUSTOMIZE THIS SECTION ACCORDING TO YOUR NEEDS
    const outletBrandMappings = [
      {
        outletName: "Grabs Kitchen - Nahur",
        brandNames: ["Grabs", "Pizza Hut", "KFC", "McDonald's", "Burger King"],
      },
      // Add more outlet-brand mappings as needed
      // {
      //   outletName: 'Another Outlet Name',
      //   brandNames: ['Brand 1', 'Brand 2', 'Brand 3']
      // }
    ];

    // Step 3: Process the mappings
    for (const mapping of outletBrandMappings) {
      console.log(`\n🔄 Processing outlet: ${mapping.outletName}`);

      // Find outlet
      const outlet = outlets.find((o) => o.name === mapping.outletName);
      if (!outlet) {
        console.log(`❌ Outlet "${mapping.outletName}" not found`);
        continue;
      }

      // Process each brand for this outlet
      for (const brandName of mapping.brandNames) {
        const brand = brands.find((b) => b.name === brandName);
        if (!brand) {
          console.log(`❌ Brand "${brandName}" not found`);
          continue;
        }

        // Check if association already exists
        const [existing] = await sequelize.query(
          "SELECT * FROM outlet_brands WHERE outlet_id = ? AND brand_id = ?",
          { replacements: [outlet.id, brand.id] }
        );

        if (existing.length > 0) {
          console.log(
            `⚠️  Association already exists: ${brandName} at ${mapping.outletName}`
          );
          continue;
        }

        // Add the brand to the outlet
        await sequelize.query(
          "INSERT INTO outlet_brands (outlet_id, brand_id, is_active, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
          { replacements: [outlet.id, brand.id, true] }
        );

        console.log(`✅ Added ${brandName} to ${mapping.outletName}`);
      }
    }

    console.log("\n🎉 Brand-outlet associations completed successfully!");

    // Step 4: Verify the results
    console.log("\n📊 Current outlet-brand associations:");
    const [associations] = await sequelize.query(`
      SELECT o.name as outlet_name, b.name as brand_name 
      FROM outlet_brands ob
      JOIN outlets o ON ob.outlet_id = o.id
      JOIN brands b ON ob.brand_id = b.id
      WHERE ob.is_active = true
      ORDER BY o.name, b.name
    `);

    associations.forEach((assoc) => {
      console.log(`🏪 ${assoc.outlet_name} → 🍔 ${assoc.brand_name}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
addBrandsToOutlets();
