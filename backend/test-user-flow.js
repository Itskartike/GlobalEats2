const jwt = require("jsonwebtoken");
const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testUserFlow() {
  try {
    // Test 1: Login with Bobby's credentials
    console.log("🔍 Test 1: Logging in with Bobby credentials...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "silentknight9011@gmail.com",
      password: "Password123",
    });

    if (!loginResponse.data.success) {
      console.error("❌ Login failed:", loginResponse.data.message);
      return;
    }

    const { user, token } = loginResponse.data.data;
    console.log("✅ Login successful:", {
      userId: user.id,
      name: user.name,
      email: user.email,
    });
    console.log("🎫 Token generated:", token.substring(0, 20) + "...");

    // Decode token to verify content
    const decoded = jwt.decode(token);
    console.log("📋 Token decoded:", decoded);

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
      console.log(
        "📦 First few orders:",
        orders
          .slice(0, 3)
          .map((o) => ({ id: o.id, status: o.status, total: o.total_amount }))
      );
    } else {
      console.error(
        "❌ Order history fetch failed:",
        orderHistoryResponse.data.message
      );
    }
  } catch (error) {
    console.error("🚫 Test error:", error.response?.data || error.message);
  }
}

testUserFlow();
