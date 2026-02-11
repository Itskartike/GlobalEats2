const { User } = require("./src/models/associations");
const bcrypt = require("bcryptjs");
require("./src/database/config/database");

async function testPasswords() {
  try {
    console.log("🔍 Testing passwords for existing users...");

    // Get all users
    const users = await User.findAll({
      attributes: ["id", "name", "email", "password"],
      limit: 5,
    });

    const commonPasswords = [
      "password",
      "Password123",
      "password123",
      "123456",
      "admin",
      "test123",
    ];

    for (const user of users) {
      console.log(`\n👤 Testing passwords for ${user.name} (${user.email})`);

      for (const pwd of commonPasswords) {
        try {
          const isValid = await bcrypt.compare(pwd, user.password);
          if (isValid) {
            console.log(
              `🎯 FOUND CORRECT PASSWORD: "${pwd}" for ${user.email}`
            );
            break;
          } else {
            console.log(`   ❌ "${pwd}" - no match`);
          }
        } catch (error) {
          console.log(`   🚫 Error testing "${pwd}": ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error("🚫 Error:", error);
  }
}

testPasswords();
