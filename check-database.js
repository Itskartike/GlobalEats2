const axios = require("axios");

async function checkDatabase() {
  try {
    console.log("🔍 Checking if user was saved to database...");

    // Try to login with the same credentials to verify user exists in database
    const loginData = {
      email: "test@example.com",
      password: "TestPassword123",
    };

    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      loginData
    );

    console.log("✅ User found in database!");
    console.log("Login successful - User ID:", response.data.data.user.id);
  } catch (error) {
    console.log("❌ Database check failed!");
    console.log("Error:", error.response?.data || error.message);
  }
}

checkDatabase();
