const axios = require("axios");

async function testAdminDashboard() {
  console.log("🧪 Testing Admin Dashboard API...\n");

  try {
    // First login as admin
    console.log("1️⃣ Logging in as Admin...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/admin/login",
      {
        email: "admin@globaleats.com",
        password: "admin123",
      }
    );

    if (!loginResponse.data.success) {
      console.log("❌ Admin login failed:", loginResponse.data.message);
      return;
    }

    console.log("✅ Admin login successful");
    const token = loginResponse.data.data.token;

    // Get dashboard data
    console.log("\n2️⃣ Fetching Dashboard Data...");
    const dashboardResponse = await axios.get(
      "http://localhost:5000/api/admin/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (dashboardResponse.data.success) {
      console.log("✅ Dashboard data fetched successfully");

      const { stats, recentOrders } = dashboardResponse.data.data;
      console.log("\n📊 Stats:", stats);

      console.log("\n📋 Recent Orders:");
      recentOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order #${order.order_number}`);
        console.log(`   👤 User: ${order.user.name} (${order.user.email})`);
        console.log(`   🆔 User ID in Order: ${order.user_id}`);
        console.log(`   💰 Total: ₹${order.total_amount}`);
        console.log(
          `   📅 Date: ${new Date(order.created_at).toLocaleDateString()}`
        );
        console.log(`   📊 Status: ${order.order_status || "No Status"}`);
      });

      // Check if any orders have the wrong user association
      const adminUserId = loginResponse.data.data.user.id;
      console.log(`\n🔍 Admin User ID: ${adminUserId}`);

      const ordersFromAdmin = recentOrders.filter(
        (order) => order.user_id === adminUserId
      );
      const ordersFromOtherUsers = recentOrders.filter(
        (order) => order.user_id !== adminUserId
      );

      console.log(`\n📈 Analysis:`);
      console.log(`   Orders attributed to Admin: ${ordersFromAdmin.length}`);
      console.log(`   Orders from other users: ${ordersFromOtherUsers.length}`);

      if (ordersFromAdmin.length > 0) {
        console.log(
          `\n⚠️  ISSUE FOUND: Some orders are attributed to admin user!`
        );
        ordersFromAdmin.forEach((order, index) => {
          console.log(
            `   ${index + 1}. Order #${order.order_number} - shows user: ${order.user.name} but has user_id: ${order.user_id}`
          );
        });
      } else {
        console.log(
          `\n✅ All orders are correctly attributed to different users`
        );
      }
    } else {
      console.log(
        "❌ Failed to fetch dashboard:",
        dashboardResponse.data.message
      );
    }
  } catch (error) {
    console.error("🚫 Error:", error.response?.data || error.message);
  }
}

testAdminDashboard();
