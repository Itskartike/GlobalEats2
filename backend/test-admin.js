const axios = require("axios");

const API_URL = "http://localhost:5000/api";

async function testAdminLogin() {
  try {
    console.log("🔐 Testing Admin Login...");

    // Test admin login
    const loginResponse = await axios.post(`${API_URL}/admin/login`, {
      email: "admin@globaleats.com",
      password: "admin123", // Default password from seeding
    });

    if (loginResponse.data.success) {
      console.log("✅ Admin login successful!");
      console.log("📧 Admin user:", loginResponse.data.data.user.email);
      console.log(
        "🔑 Token received:",
        loginResponse.data.data.token ? "YES" : "NO"
      );

      // Test dashboard endpoint with token
      const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${loginResponse.data.data.token}`,
        },
      });

      if (dashboardResponse.data.success) {
        console.log("✅ Dashboard access successful!");
        console.log("📊 Stats:", dashboardResponse.data.data.stats);
        console.log(
          "📋 Recent orders count:",
          dashboardResponse.data.data.recentOrders.length
        );
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

async function testInvalidLogin() {
  try {
    console.log("\n🚫 Testing Invalid Admin Login...");

    await axios.post(`${API_URL}/admin/login`, {
      email: "admin@globaleats.com",
      password: "wrongpassword",
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("✅ Invalid login properly rejected");
    } else {
      console.log("❌ Unexpected error:", error.response?.data);
    }
  }
}

async function testUnauthorizedDashboard() {
  try {
    console.log("\n🔒 Testing Unauthorized Dashboard Access...");

    await axios.get(`${API_URL}/admin/dashboard`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("✅ Unauthorized access properly blocked");
    } else {
      console.log("❌ Unexpected error:", error.response?.data);
    }
  }
}

async function runTests() {
  console.log("🧪 Starting Admin Authentication Tests\n");

  await testAdminLogin();
  await testInvalidLogin();
  await testUnauthorizedDashboard();

  console.log("\n✅ All tests completed!");
  process.exit(0);
}

// Run tests
runTests().catch(console.error);
