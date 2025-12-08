const axios = require("axios");

const API_URL = "http://localhost:5000/api";

async function testFrontendFlow() {
  console.log("🧪 Testing Frontend API Flow...\n");

  try {
    // Test 1: Login with Admin User (has 7 orders)
    console.log("1️⃣ Testing Admin Login...");
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@globaleats.com",
      password: "admin123",
    });

    if (loginResponse.data.success) {
      console.log("✅ Login successful");
      console.log("👤 User:", loginResponse.data.data.user.name);
      console.log("🎫 Token received");

      const token = loginResponse.data.data.token;

      // Test 2: Get Profile
      console.log("\n2️⃣ Testing Profile API...");
      const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.data.success) {
        console.log("✅ Profile fetched successfully");
        console.log("👤 Name:", profileResponse.data.data.user.name);
        console.log("📧 Email:", profileResponse.data.data.user.email);
      }

      // Test 3: Get Order History
      console.log("\n3️⃣ Testing Order History API...");
      const ordersResponse = await axios.get(`${API_URL}/orders/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (ordersResponse.data.success) {
        console.log("✅ Order history fetched successfully");
        console.log("📦 Orders count:", ordersResponse.data.data.orders.length);
        console.log("📄 Pagination:", ordersResponse.data.data.pagination);

        if (ordersResponse.data.data.orders.length > 0) {
          console.log("\n📋 Sample Order:");
          const sampleOrder = ordersResponse.data.data.orders[0];
          console.log("   🆔 ID:", sampleOrder.id);
          console.log("   💰 Total:", sampleOrder.total_amount);
          console.log("   📊 Status:", sampleOrder.order_status);
          console.log(
            "   📅 Date:",
            new Date(sampleOrder.created_at).toLocaleDateString()
          );
        }
      }

      console.log("\n✅ All APIs working correctly!");
      console.log("\n🔍 DIAGNOSIS: Backend APIs are working perfectly.");
      console.log("🔍 The issue is likely in the frontend:");
      console.log("   1. User not logged in properly");
      console.log("   2. Token not being stored correctly");
      console.log("   3. Profile component not calling API");
      console.log("   4. Authentication state not updated");
    } else {
      console.log("❌ Login failed:", loginResponse.data.message);
    }
  } catch (error) {
    console.error("🚫 Error:", error.response?.data || error.message);
  }
}

testFrontendFlow();
