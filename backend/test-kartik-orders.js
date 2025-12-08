const axios = require("axios");

async function testKartikOrders() {
  console.log("🧪 Testing kartik's Order History...\n");

  try {
    // We need to find kartik's password first
    console.log("1️⃣ Testing kartik login...");

    // Use the correct password
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "silentknight9011@gmail.com",
        password: "password123",
      }
    );

    if (!loginResponse.data.success) {
      console.log("❌ kartik login failed:", loginResponse.data.message);
      return;
    }

    console.log("✅ kartik login successful");
    const kartikToken = loginResponse.data.data.token;

    // Test order history API
    console.log("\n2️⃣ Fetching kartik's order history...");
    const ordersResponse = await axios.get(
      "http://localhost:5000/api/orders/history",
      {
        headers: {
          Authorization: `Bearer ${kartikToken}`,
        },
      }
    );

    console.log("📊 kartik's Order History:");
    console.log("Success:", ordersResponse.data.success);

    if (ordersResponse.data.success) {
      const { orders, pagination } = ordersResponse.data.data;
      console.log("📦 Orders count:", orders.length);
      console.log("📄 Pagination:", pagination);

      if (orders.length > 0) {
        console.log("\n📋 kartik's orders:");
        orders.forEach((order, index) => {
          console.log(`${index + 1}. Order #${order.order_number}`);
          console.log(`   Total: ₹${order.total_amount}`);
          console.log(
            `   Status: ${order.order_status || order.status || "No status"}`
          );
          console.log(`   Created: ${order.created_at || order.createdAt}`);
          console.log(`   User ID: ${order.user_id}`);
        });

        console.log(
          "\n🎯 RESULT: If you login as kartik, you should see orders!"
        );
      } else {
        console.log("❌ No orders found for kartik (unexpected)");
      }
    } else {
      console.log("❌ API failed:", ordersResponse.data.message);
    }
  } catch (error) {
    console.error("🚫 Error:", error.response?.data || error.message);
  }
}

testKartikOrders();
