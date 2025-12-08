const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testCompleteFlow() {
  try {
    console.log("\n🔍 === COMPREHENSIVE ORDER HISTORY DEBUG TEST ===\n");

    // Step 1: Check if backend is accessible
    console.log("1️⃣ Testing backend connectivity...");
    try {
      const healthResponse = await axios.get("http://localhost:5000/health");
      console.log("✅ Backend is accessible:", healthResponse.data.message);
    } catch (error) {
      console.log("❌ Backend not accessible:", error.message);
      return;
    }

    // Step 2: Login with John (test user)
    console.log("\n2️⃣ Attempting login with John...");
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: "john@example.com",
        password: "password123",
      });

      if (loginResponse.data.success) {
        const { user, token } = loginResponse.data.data;
        console.log("✅ Login successful:", {
          userId: user.id,
          name: user.name,
          email: user.email,
        });
        console.log("🎫 Token:", token.substring(0, 30) + "...");

        // Step 3: Test profile endpoint
        console.log("\n3️⃣ Testing profile endpoint...");
        const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileResponse.data.success) {
          console.log("✅ Profile fetch successful:", {
            userId: profileResponse.data.data.user.id,
            name: profileResponse.data.data.user.name,
          });
        }

        // Step 4: Test order history endpoint
        console.log("\n4️⃣ Testing order history endpoint...");
        const orderHistoryResponse = await axios.get(
          `${API_BASE}/orders/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (orderHistoryResponse.data.success) {
          const orders = orderHistoryResponse.data.data.orders;
          const pagination = orderHistoryResponse.data.data.pagination;

          console.log("✅ Order history fetch successful:");
          console.log("📊 Pagination:", {
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalOrders: pagination.totalOrders,
          });
          console.log("📦 Orders found:", orders.length);

          if (orders.length > 0) {
            console.log("📋 First 3 orders:");
            orders.slice(0, 3).forEach((order, index) => {
              console.log(
                `   ${index + 1}. Order #${order.order_number} - Status: ${order.status} - Total: ₹${order.total_amount}`
              );
            });
          }

          return { user, token, orders, pagination };
        } else {
          console.log(
            "❌ Order history fetch failed:",
            orderHistoryResponse.data.message
          );
        }
      } else {
        console.log("❌ Login failed:", loginResponse.data.message);
      }
    } catch (loginError) {
      console.log(
        "❌ Login error:",
        loginError.response?.data?.message || loginError.message
      );

      // Try with kartik's credentials instead
      console.log("\n2️⃣b Trying with kartik credentials...");
      try {
        const loginResponse2 = await axios.post(`${API_BASE}/auth/login`, {
          email: "silentknight9011@gmail.com",
          password: "Password123",
        });

        if (loginResponse2.data.success) {
          const { user, token } = loginResponse2.data.data;
          console.log("✅ Login successful with kartik:", {
            userId: user.id,
            name: user.name,
            email: user.email,
          });

          // Test order history with kartik
          const orderHistoryResponse = await axios.get(
            `${API_BASE}/orders/history`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (orderHistoryResponse.data.success) {
            const orders = orderHistoryResponse.data.data.orders;
            console.log(
              "✅ Kartik order history:",
              orders.length,
              "orders found"
            );
          }
        }
      } catch (error2) {
        console.log(
          "❌ Second login also failed:",
          error2.response?.data?.message || error2.message
        );
      }
    }

    // Step 5: Test with a known working user from database
    console.log("\n5️⃣ Testing with admin user...");
    try {
      const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: "admin@globaleats.com",
        password: "Password123",
      });

      if (adminLoginResponse.data.success) {
        const { user, token } = adminLoginResponse.data.data;
        console.log("✅ Admin login successful");

        const orderHistoryResponse = await axios.get(
          `${API_BASE}/orders/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (orderHistoryResponse.data.success) {
          console.log(
            "✅ Admin order history fetch successful:",
            orderHistoryResponse.data.data.orders.length,
            "orders"
          );
        }
      }
    } catch (adminError) {
      console.log(
        "❌ Admin login failed:",
        adminError.response?.data?.message || adminError.message
      );
    }
  } catch (error) {
    console.error("🚫 Test error:", error.message);
  }
}

testCompleteFlow();
