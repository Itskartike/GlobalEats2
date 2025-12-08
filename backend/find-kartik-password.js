const { User } = require("./src/models/associations");
const bcrypt = require("bcryptjs");
require("./src/database/config/database");

async function findKartikPassword() {
  try {
    console.log("🔍 Finding kartik password...");

    const kartikUser = await User.findOne({
      where: { email: "silentknight9011@gmail.com" },
    });

    if (!kartikUser) {
      console.log("❌ kartik user not found");
      return;
    }

    const passwords = [
      "password123",
      "kartik123",
      "silentknight",
      "123456",
      "password",
      "qwerty",
      "letmein",
      "12345678",
      "kartik@123",
      "silent123",
    ];

    for (const pwd of passwords) {
      try {
        const isValid = await bcrypt.compare(pwd, kartikUser.password);
        if (isValid) {
          console.log(`🎯 FOUND kartik PASSWORD: "${pwd}"`);
          return pwd;
        } else {
          console.log(`   ❌ "${pwd}" - no match`);
        }
      } catch (error) {
        console.log(`   🚫 Error testing "${pwd}": ${error.message}`);
      }
    }

    console.log("❌ Could not find kartik password");
  } catch (error) {
    console.error("🚫 Error:", error);
  }
}

findKartikPassword();
