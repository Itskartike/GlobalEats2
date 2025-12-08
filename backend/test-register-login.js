const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testRegisterAndLogin() {
  try {
    // Generate unique email for testing
    const testEmail = `testuser${Date.now()}@example.com`;
    const testPassword = "TestPassword123";

    // Test 1: Register a new user
    console.log("🔍 Test 1: Registering a new user...");
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: "Test User",
      email: testEmail,
      phone: `9876543210`,
      password: testPassword,
    });

    if (!registerResponse.data.success) {
      console.error("❌ Registration failed:", registerResponse.data.message);
      return;
    }

    const { user, token } = registerResponse.data.data;
    console.log("✅ Registration successful:", {
      userId: user.id,
      name: user.name,
      email: user.email,
    });
    console.log("🎫 Token generated:", token.substring(0, 20) + "...");

    // Test 2: Get Profile
    console.log("\n🔍 Test 2: Getting user profile...");
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (profileResponse.data.success) {
      const profileUser = profileResponse.data.data.user;
      console.log("✅ Profile fetch successful:", {
        userId: profileUser.id,
        name: profileUser.name,
        email: profileUser.email,
      });
    } else {
      console.error("❌ Profile fetch failed:", profileResponse.data.message);
    }

    // Test 3: Get Order History
    console.log("\n🔍 Test 3: Getting order history...");
    const orderHistoryResponse = await axios.get(`${API_BASE}/orders/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (orderHistoryResponse.data.success) {
      const orders = orderHistoryResponse.data.data.orders;
      console.log("✅ Order history fetch successful:", {
        orderCount: orders.length,
      });
      if (orders.length > 0) {
        console.log(
          "📦 First few orders:",
          orders
            .slice(0, 3)
            .map((o) => ({ id: o.id, status: o.status, total: o.total_amount }))
        );
      } else {
        console.log("📦 No orders found for new user (expected)");
      }
    } else {
      console.error(
        "❌ Order history fetch failed:",
        orderHistoryResponse.data.message
      );
    }

    // Test 4: Login with the new user credentials
    console.log("\n🔍 Test 4: Testing login with new user...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });

    if (loginResponse.data.success) {
      console.log("✅ Login successful with new user");
    } else {
      console.error(
        "❌ Login failed with new user:",
        loginResponse.data.message
      );
    }
  } catch (error) {
    console.error("🚫 Test error:", error.response?.data || error.message);
  }
}

testRegisterAndLogin();
