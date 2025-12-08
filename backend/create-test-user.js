const { User } = require("./src/models/associations");
require("./src/database/config/database");

async function createTestUser() {
  try {
    console.log("🔍 Creating test user...");

    // Check if test user already exists
    const existingUser = await User.findOne({
      where: { email: "test@example.com" },
    });

    if (existingUser) {
      console.log("📋 Test user already exists:", {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      });
      return existingUser;
    }

    // Create new test user
    const newUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      password: "Password123",
      role: "customer",
    });

    console.log("✅ Test user created successfully:", {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return newUser;
  } catch (error) {
    console.error("🚫 Error creating test user:", error);
  }
}

createTestUser();
