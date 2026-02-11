const axios = require("axios");

async function testDashboard() {
  try {
    console.log("🔐 First, let's login to get a valid token...");

    // Login first to get a real token
    const loginResponse = await axios.post(
      "http://localhost:5000/api/admin/login",
      {
        email: "admin@globaleats.com",
        password: "admin123",
      }
    );

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log("✅ Login successful, testing dashboard...");

      // Now test dashboard with real token
      const dashboardResponse = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "✅ Dashboard data:",
        JSON.stringify(dashboardResponse.data, null, 2)
      );
    } else {
      console.log("❌ Login failed:", loginResponse.data.message);
    }
  } catch (error) {
    console.error("❌ Dashboard test error:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("Full error:", error.response?.data);
  }
}

testDashboard();
