const axios = require("axios");

// Simple test to check signup functionality
async function testSignup() {
  try {
    console.log("🔍 Testing signup API...");

    const signupData = {
      name: "Test User",
      email: "test@example.com",
      password: "TestPassword123", // Strong password with uppercase, lowercase, and numbers
      phone: "1234567890",
    };

    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      signupData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Signup successful!");
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));

    // Check if we received tokens
    if (response.data.token && response.data.refreshToken) {
      console.log("✅ Tokens received successfully");
    } else {
      console.log("❌ Missing tokens in response");
    }

    // Check if user data is present
    if (response.data.user && response.data.user.id) {
      console.log("✅ User data present with ID:", response.data.user.id);
    } else {
      console.log("❌ Missing user data in response");
    }
  } catch (error) {
    console.log("❌ Signup failed!");
    console.log("Error status:", error.response?.status);
    console.log("Error data:", error.response?.data);
    console.log("Error message:", error.message);
  }
}

testSignup();
