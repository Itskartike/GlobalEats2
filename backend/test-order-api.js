const axios = require("axios");

async function testOrderHistory() {
  console.log("🧪 Testing Order History API...\n");

  try {
    // Login as admin (we know they have orders)
    console.log("1️⃣ Logging in as admin...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
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
    const userId = loginResponse.data.data.user.id;

    // Test order history API
    console.log("\n2️⃣ Testing order history API...");
    const ordersResponse = await axios.get(
      "http://localhost:5000/api/orders/history",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("📊 Order History Response:");
    console.log("Success:", ordersResponse.data.success);
    console.log("Status Code:", ordersResponse.status);

    if (ordersResponse.data.success) {
      const { orders, pagination } = ordersResponse.data.data;
      console.log("📦 Orders count:", orders.length);
      console.log("📄 Pagination:", pagination);

      if (orders.length > 0) {
        console.log("\n📋 Order details:");
        orders.forEach((order, index) => {
          console.log(`${index + 1}. Order #${order.order_number}`);
          console.log(`   ID: ${order.id}`);
          console.log(`   Total: ₹${order.total_amount}`);
          console.log(`   Status: ${order.order_status || "No status"}`);
          console.log(`   Created: ${order.created_at}`);
          console.log(`   User ID: ${order.user_id}`);
        });
      } else {
        console.log("📭 No orders found");
      }
    } else {
      console.log("❌ API returned failure:", ordersResponse.data.message);
    }

    // Also test with john (regular user)
    console.log("\n3️⃣ Testing with regular user (john)...");
    const johnLoginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "john@example.com",
        password: "password123",
      }
    );

    if (johnLoginResponse.data.success) {
      const johnToken = johnLoginResponse.data.data.token;
      const johnOrdersResponse = await axios.get(
        "http://localhost:5000/api/orders/history",
        {
          headers: {
            Authorization: `Bearer ${johnToken}`,
          },
        }
      );

      console.log("👤 John's orders:");
      if (johnOrdersResponse.data.success) {
        console.log(
          "Orders count:",
          johnOrdersResponse.data.data.orders.length
        );
        if (johnOrdersResponse.data.data.orders.length > 0) {
          johnOrdersResponse.data.data.orders.forEach((order, index) => {
            console.log(
              `${index + 1}. #${order.order_number} - ₹${order.total_amount}`
            );
          });
        }
      }
    }
  } catch (error) {
    console.error("🚫 Error:", error.response?.data || error.message);
  }
}

testOrderHistory();
