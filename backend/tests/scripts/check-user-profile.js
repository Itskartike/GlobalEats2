const { User } = require("./src/models/associations");
require("./src/database/config/database");

async function checkUserProfile() {
  try {
    console.log("🔍 Checking user profile data...\n");

    // Get admin user data to see all available fields
    const adminUser = await User.findOne({
      where: { email: "admin@globaleats.com" },
    });

    if (adminUser) {
      console.log("👤 Admin User Full Profile:");
      console.log("ID:", adminUser.id);
      console.log("Name:", adminUser.name);
      console.log("Email:", adminUser.email);
      console.log("Phone:", adminUser.phone);
      console.log("Role:", adminUser.role);
      console.log("Is Verified:", adminUser.is_verified);
      console.log("Is Active:", adminUser.is_active);
      console.log("Email Verified At:", adminUser.email_verified_at);
      console.log("Preferences:", adminUser.preferences);
      console.log("Notification Settings:", adminUser.notification_settings);
      console.log("Created At:", adminUser.created_at);
      console.log("Updated At:", adminUser.updated_at);
    }

    // Get john user data
    const johnUser = await User.findOne({
      where: { email: "john@example.com" },
    });

    if (johnUser) {
      console.log("\n👤 John User Profile:");
      console.log("ID:", johnUser.id);
      console.log("Name:", johnUser.name);
      console.log("Email:", johnUser.email);
      console.log("Phone:", johnUser.phone);
      console.log("Role:", johnUser.role);
      console.log("Is Verified:", johnUser.is_verified);
      console.log("Is Active:", johnUser.is_active);
      console.log("Email Verified At:", johnUser.email_verified_at);
      console.log("Preferences:", johnUser.preferences);
      console.log("Notification Settings:", johnUser.notification_settings);
      console.log("Created At:", johnUser.created_at);
      console.log("Updated At:", johnUser.updated_at);
    }

    console.log("\n📊 Available User Fields:");
    console.log("- id, name, email, phone, role");
    console.log("- is_verified, is_active, email_verified_at");
    console.log("- preferences (JSONB), notification_settings (JSONB)");
    console.log("- created_at, updated_at");
  } catch (error) {
    console.error("🚫 Error:", error);
  }
}

checkUserProfile();
