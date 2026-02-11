const { User } = require("./src/models/associations");
const bcrypt = require("bcryptjs");
require("./src/database/config/database");

async function findAdminPassword() {
  try {
    console.log("🔍 Finding Admin password...");

    const adminUser = await User.findOne({
      where: { email: "admin@globaleats.com" },
    });

    if (!adminUser) {
      console.log("❌ Admin user not found");
      return;
    }

    const morePasswords = [
      "admin123",
      "Admin123",
      "globalEats123",
      "GlobalEats123",
      "secret",
      "admin@123",
      "admin2024",
      "admin2023",
      "1234",
      "12345",
      "qwerty",
      "letmein",
      "welcome",
      "Welcome123",
    ];

    for (const pwd of morePasswords) {
      try {
        const isValid = await bcrypt.compare(pwd, adminUser.password);
        if (isValid) {
          console.log(`🎯 FOUND ADMIN PASSWORD: "${pwd}"`);
          return pwd;
        } else {
          console.log(`   ❌ "${pwd}" - no match`);
        }
      } catch (error) {
        console.log(`   🚫 Error testing "${pwd}": ${error.message}`);
      }
    }

    console.log("❌ Could not find admin password");
  } catch (error) {
    console.error("🚫 Error:", error);
  }
}

findAdminPassword();
