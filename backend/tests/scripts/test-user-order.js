const axios = require("axios");

async function testUserOrderCreation() {
  console.log("🧪 Testing User Order Creation...\n");

  try {
    // Step 1: Login as john (regular user)
    console.log("1️⃣ Logging in as john (regular user)...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "john@example.com",
        password: "password123",
      }
    );

    if (!loginResponse.data.success) {
      console.log("❌ john login failed:", loginResponse.data.message);
      return;
    }

    console.log("✅ john login successful");
    console.log("👤 User ID:", loginResponse.data.data.user.id);
    console.log("📧 User Email:", loginResponse.data.data.user.email);

    const johnToken = loginResponse.data.data.token;
    const johnUserId = loginResponse.data.data.user.id;

    // Step 2: Check token by getting profile
    console.log("\n2️⃣ Verifying token with profile check...");
    const profileResponse = await axios.get(
      "http://localhost:5000/api/auth/profile",
      {
        headers: { Authorization: `Bearer ${johnToken}` },
      }
    );

    if (profileResponse.data.success) {
      console.log("✅ Profile fetch successful");
      console.log("👤 Profile User ID:", profileResponse.data.data.user.id);
      console.log("📧 Profile Email:", profileResponse.data.data.user.email);
    }

    // Step 3: Now test the admin login and compare
    console.log("\n3️⃣ Comparing with admin login...");
    const adminLoginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "admin@globaleats.com",
        password: "admin123",
      }
    );

    if (adminLoginResponse.data.success) {
      console.log("✅ Admin login successful");
      console.log("👤 Admin User ID:", adminLoginResponse.data.data.user.id);
      console.log("📧 Admin Email:", adminLoginResponse.data.data.user.email);
    }

    // Step 4: Check if there's any issue with the JWT tokens
    console.log("\n4️⃣ Analyzing JWT tokens...");
    console.log(
      "🎫 john token (first 50 chars):",
      johnToken.substring(0, 50) + "..."
    );
    console.log(
      "🎫 admin token (first 50 chars):",
      adminLoginResponse.data.data.token.substring(0, 50) + "..."
    );

    // Step 5: Check recent orders to see if new orders are being attributed correctly
    console.log("\n5️⃣ Checking recent order attribution...");
    const adminToken = adminLoginResponse.data.data.token;
    const dashboardResponse = await axios.get(
      "http://localhost:5000/api/admin/dashboard",
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    if (dashboardResponse.data.success) {
      const recentOrders = dashboardResponse.data.data.recentOrders.slice(0, 3);
      console.log("📋 Last 3 orders:");
      recentOrders.forEach((order, index) => {
        console.log(
          `   ${index + 1}. #${order.order_number.slice(-8)} - User: ${order.user.name} (ID: ${order.user_id})`
        );
      });
    }

    console.log("\n🔍 ANALYSIS:");
    console.log(`   john User ID: ${johnUserId}`);
    console.log(`   Admin User ID: ${adminLoginResponse.data.data.user.id}`);
    console.log(
      `   Expected: Orders should have john's ID when placed by john`
    );
    console.log(
      `   Problem: Some orders have admin ID instead of actual user ID`
    );
  } catch (error) {
    console.error("🚫 Error:", error.response?.data || error.message);
  }
}

testUserOrderCreation();
