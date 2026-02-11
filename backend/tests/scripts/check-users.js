const { User } = require("./src/models/associations");
require("./src/database/config/database");

async function checkUsers() {
  try {
    console.log("🔍 Checking users in database...");
    const users = await User.findAll({
      attributes: ["id", "name", "email", "is_active"],
      limit: 10,
    });

    console.log(`📊 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.name} (${user.email}) - Active: ${user.is_active} - ID: ${user.id}`
      );
    });
  } catch (error) {
    console.error("🚫 Error checking users:", error);
  }
}

checkUsers();
