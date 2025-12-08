const axios = require("axios");

async function testFrontendToBackend() {
  console.log("🔍 Testing frontend-to-backend connection...");

  try {
    // Test the exact same call the frontend would make
    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        name: "Frontend Test User",
        email: "frontend-test@example.com",
        password: "FrontendTest123",
        phone: "9876543210",
        role: "customer",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Frontend API call successful!");
    console.log("Status:", response.status);
    console.log("Response structure matches frontend expectation:");
    console.log("- success:", response.data.success);
    console.log("- message:", response.data.message);
    console.log("- data.user.id:", response.data.data?.user?.id);
    console.log(
      "- data.token:",
      response.data.data?.token ? "Present" : "Missing"
    );
    console.log(
      "- data.refreshToken:",
      response.data.data?.refreshToken ? "Present" : "Missing"
    );
  } catch (error) {
    console.log("❌ Frontend API call failed!");
    console.log("Status:", error.response?.status);
    console.log("Response:", JSON.stringify(error.response?.data, null, 2));
    console.log("Error:", error.message);
  }
}

testFrontendToBackend();
