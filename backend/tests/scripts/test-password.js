const { User } = require("./src/models/associations");
const bcrypt = require("bcryptjs");
require("./src/database/config/database");

async function testPassword() {
  try {
    console.log("🔍 Checking Bobby password...");
    const user = await User.findOne({
      where: { email: "dclilly3103@gmail.com" },
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("✅ User found:", user.name);

    // Test common passwords
    const passwords = ["password", "password123", "123456", "admin", "test123"];

    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(
        `Testing password "${pwd}": ${isValid ? "✅ MATCH" : "❌ No match"}`
      );
      if (isValid) {
        console.log(`🎯 Found correct password: ${pwd}`);
        break;
      }
    }
  } catch (error) {
    console.error("🚫 Error:", error);
  }
}

testPassword();
