const axios = require("axios");

async function testFixedOrderHistory() {
  console.log("🔧 Testing Fixed Order History Endpoint...\n");

  const baseURL = "http://localhost:5000/api";

  try {
    // Login first
    console.log("1. Logging in...");
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: "kartik@test.com",
      password: "kartik123",
    });
    const token = loginResponse.data.data.token;
    console.log("✅ Login successful");

    // Test order history endpoint after fix
    console.log("\n2. Testing fixed order history endpoint...");
    const historyResponse = await axios.get(
      `${baseURL}/orders/history?page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (historyResponse.data.success) {
      const orders = historyResponse.data.data.orders;
      console.log(
        `✅ Order history fetched successfully! Found ${orders.length} orders`
      );

      if (orders.length > 0) {
        console.log("\n📋 Order History Structure Test:");

        const firstOrder = orders[0];
        console.log("\n--- First Order Analysis ---");
        console.log("✅ Order ID:", firstOrder.id);
        console.log("✅ Order Number:", firstOrder.orderNumber);
        console.log("✅ Status:", firstOrder.status);
        console.log("✅ Total Amount: ₹", firstOrder.totalAmount);
        console.log("✅ Created At:", firstOrder.createdAt);

        // Test delivery address
        if (firstOrder.deliveryAddress) {
          console.log("\n🏠 Delivery Address Structure:");
          console.log(
            "✅ Recipient:",
            firstOrder.deliveryAddress.recipient_name || "N/A"
          );
          console.log(
            "✅ Street:",
            firstOrder.deliveryAddress.street_address || "N/A"
          );
          console.log("✅ City:", firstOrder.deliveryAddress.city || "N/A");
          console.log("✅ State:", firstOrder.deliveryAddress.state || "N/A");
          console.log(
            "✅ Pincode:",
            firstOrder.deliveryAddress.pincode || "N/A"
          );
          console.log("✅ Phone:", firstOrder.deliveryAddress.phone || "N/A");
          console.log(
            "✅ Full Address:",
            firstOrder.deliveryAddress.fullAddress || "N/A"
          );
          console.log(
            "✅ Short Address:",
            firstOrder.deliveryAddress.shortAddress || "N/A"
          );
        } else {
          console.log("❌ No delivery address found");
        }

        // Test restaurant/outlet info
        if (firstOrder.restaurant) {
          console.log("\n🏪 Restaurant/Outlet Structure:");
          console.log("✅ Outlet ID:", firstOrder.restaurant.id);
          console.log("✅ Outlet Name:", firstOrder.restaurant.outletName);
          console.log(
            "✅ Outlet Address:",
            firstOrder.restaurant.outletAddress
          );
          console.log("✅ Phone:", firstOrder.restaurant.phone || "N/A");

          if (firstOrder.restaurant.brand) {
            console.log("✅ Brand Name:", firstOrder.restaurant.brand.name);
            console.log(
              "✅ Cuisine:",
              firstOrder.restaurant.brand.cuisine || "N/A"
            );
            console.log("✅ Logo:", firstOrder.restaurant.brand.logo || "N/A");
            console.log(
              "✅ Rating:",
              firstOrder.restaurant.brand.rating || "N/A"
            );
          } else {
            console.log("⚠️ No brand info found");
          }
        } else {
          console.log("❌ No restaurant info found");
        }

        // Test items
        if (firstOrder.items && firstOrder.items.length > 0) {
          console.log("\n🍽️ Items Structure:");
          console.log("✅ Items Count:", firstOrder.items.length);
          console.log("✅ Total Quantity:", firstOrder.totalQuantity || "N/A");
          console.log("✅ Item Count:", firstOrder.itemCount || "N/A");

          console.log("\nFirst 3 Items:");
          firstOrder.items.slice(0, 3).forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name}`);
            console.log(`     - Quantity: ${item.quantity}`);
            console.log(`     - Price: ₹${item.price}`);
            console.log(`     - Total: ₹${item.totalPrice}`);
            console.log(
              `     - Vegetarian: ${item.isVegetarian ? "🟢" : "🔴"}`
            );
            console.log(`     - Category: ${item.category || "N/A"}`);
          });
        } else {
          console.log("❌ No items found");
        }

        // Test pagination
        if (historyResponse.data.data.pagination) {
          console.log("\n📄 Pagination Structure:");
          const pagination = historyResponse.data.data.pagination;
          console.log("✅ Current Page:", pagination.currentPage);
          console.log("✅ Total Pages:", pagination.totalPages);
          console.log("✅ Total Orders:", pagination.totalOrders);
          console.log("✅ Has Next:", pagination.hasNext);
          console.log("✅ Has Previous:", pagination.hasPrev);
        }

        console.log("\n🎯 Frontend Compatibility Check:");
        const issues = [];

        orders.forEach((order, index) => {
          if (!order.deliveryAddress || !order.deliveryAddress.street_address) {
            issues.push(`Order ${index + 1}: Missing delivery address`);
          }
          if (!order.restaurant) {
            issues.push(`Order ${index + 1}: Missing restaurant info`);
          }
          if (!order.items || order.items.length === 0) {
            issues.push(`Order ${index + 1}: Missing items`);
          }
        });

        if (issues.length === 0) {
          console.log("✅ All orders have complete data for frontend display");
          console.log(
            "✅ ProfileNew.tsx should now show delivery addresses correctly"
          );
          console.log("✅ Restaurant information is available");
          console.log("✅ Item summaries are ready for display");
        } else {
          console.log("⚠️ Some issues found:");
          issues.forEach((issue) => console.log(`  - ${issue}`));
        }
      } else {
        console.log("ℹ️ No orders found in history");
      }
    } else {
      console.log(
        "❌ Order history request failed:",
        historyResponse.data.message
      );
    }
  } catch (error) {
    if (error.response) {
      console.log("❌ API Error:");
      console.log("Status:", error.response.status);
      console.log("Message:", error.response.data.message || "Unknown error");
      console.log("Error Details:", error.response.data.error || "No details");
    } else {
      console.log("❌ Network/Other Error:", error.message);
    }
  }
}

testFixedOrderHistory();
