// Test script to check what happens with the addresses API call
const axios = require("axios");

async function testAddressesAPI() {
  console.log("🔍 Testing addresses API call that causes logout...");

  try {
    // First, login to get a token
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "test@example.com",
        password: "TestPassword123",
      }
    );

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log("✅ Login successful, got token");

      // Now try to call addresses API with the token
      const addressesResponse = await axios.get(
        "http://localhost:5000/api/addresses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Addresses API call successful!");
      console.log("Response:", addressesResponse.data);
    }
  } catch (error) {
    console.log("❌ API call failed!");
    console.log("Status:", error.response?.status);
    console.log("Response:", JSON.stringify(error.response?.data, null, 2));
    console.log("Error:", error.message);
  }
}

testAddressesAPI();
