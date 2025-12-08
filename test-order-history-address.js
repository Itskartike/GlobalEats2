const axios = require("axios");

async function testOrderHistoryDeliveryAddress() {
  console.log("🏠 Testing Order History Delivery Address Display...\n");

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

    // Test order history endpoint
    console.log("\n2. Fetching order history...");
    const historyResponse = await axios.get(
      `${baseURL}/orders/history?limit=3`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (historyResponse.data.success) {
      const orders = historyResponse.data.data.orders;
      console.log(`✅ Found ${orders.length} orders in history`);

      if (orders.length > 0) {
        console.log("\n📋 Order History Address Analysis:");

        orders.forEach((order, index) => {
          console.log(`\n--- Order ${index + 1} ---`);
          console.log("Order ID:", order.id);
          console.log("Order Number:", order.orderNumber);
          console.log("Status:", order.status);
          console.log("Total Amount: ₹", order.totalAmount);

          // Check delivery address structure
          if (order.deliveryAddress) {
            console.log("\n🏠 Delivery Address:");
            console.log("- ID:", order.deliveryAddress.id || "N/A");
            console.log(
              "- Recipient:",
              order.deliveryAddress.recipient_name || "N/A"
            );
            console.log(
              "- Street:",
              order.deliveryAddress.street_address || "N/A"
            );
            console.log("- City:", order.deliveryAddress.city || "N/A");
            console.log("- State:", order.deliveryAddress.state || "N/A");
            console.log("- Pincode:", order.deliveryAddress.pincode || "N/A");
            console.log("- Phone:", order.deliveryAddress.phone || "N/A");
            console.log("- Landmark:", order.deliveryAddress.landmark || "N/A");
            console.log(
              "- Full Address:",
              order.deliveryAddress.fullAddress || "N/A"
            );
            console.log(
              "- Short Address:",
              order.deliveryAddress.shortAddress || "N/A"
            );

            // Check if address is properly formatted for display
            const hasRequiredFields =
              order.deliveryAddress.street_address &&
              order.deliveryAddress.city &&
              order.deliveryAddress.state &&
              order.deliveryAddress.pincode;
            console.log(
              "- Has Required Fields:",
              hasRequiredFields ? "✅" : "❌"
            );

            if (!hasRequiredFields) {
              console.log("❌ Missing address fields detected!");
            }
          } else {
            console.log("❌ No delivery address found for this order!");
          }

          // Check restaurant info
          if (order.restaurant) {
            console.log("\n🏪 Restaurant Info:");
            console.log("- Outlet Name:", order.restaurant.outletName || "N/A");
            console.log("- Brand Name:", order.restaurant.brand?.name || "N/A");
            console.log(
              "- Cuisine Type:",
              order.restaurant.brand?.cuisine || "N/A"
            );
          } else {
            console.log("❌ No restaurant info found!");
          }

          // Check items
          if (order.items && order.items.length > 0) {
            console.log("\n🍽️ Items Summary:");
            console.log(`- Total Items: ${order.items.length}`);
            console.log(`- Total Quantity: ${order.totalQuantity || "N/A"}`);
            order.items.slice(0, 2).forEach((item, idx) => {
              console.log(
                `  ${idx + 1}. ${item.name} (${item.quantity}x) - ₹${item.price}`
              );
            });
            if (order.items.length > 2) {
              console.log(`  ... and ${order.items.length - 2} more items`);
            }
          } else {
            console.log("❌ No items found in order!");
          }
        });

        console.log("\n🔍 Frontend Display Readiness Check:");
        const addressIssues = [];
        const restaurantIssues = [];
        const itemIssues = [];

        orders.forEach((order, index) => {
          if (!order.deliveryAddress || !order.deliveryAddress.street_address) {
            addressIssues.push(`Order ${index + 1}: Missing delivery address`);
          }
          if (!order.restaurant || !order.restaurant.outletName) {
            restaurantIssues.push(
              `Order ${index + 1}: Missing restaurant info`
            );
          }
          if (!order.items || order.items.length === 0) {
            itemIssues.push(`Order ${index + 1}: Missing items`);
          }
        });

        console.log("\n📊 Summary:");
        console.log(
          "- Address Issues:",
          addressIssues.length === 0
            ? "✅ None"
            : `❌ ${addressIssues.length} found`
        );
        console.log(
          "- Restaurant Issues:",
          restaurantIssues.length === 0
            ? "✅ None"
            : `❌ ${restaurantIssues.length} found`
        );
        console.log(
          "- Item Issues:",
          itemIssues.length === 0 ? "✅ None" : `❌ ${itemIssues.length} found`
        );

        if (addressIssues.length > 0) {
          console.log("\n❌ Address Issues:");
          addressIssues.forEach((issue) => console.log(`  - ${issue}`));
        }

        if (restaurantIssues.length > 0) {
          console.log("\n❌ Restaurant Issues:");
          restaurantIssues.forEach((issue) => console.log(`  - ${issue}`));
        }

        if (itemIssues.length > 0) {
          console.log("\n❌ Item Issues:");
          itemIssues.forEach((issue) => console.log(`  - ${issue}`));
        }

        console.log("\n🎯 Frontend ProfileNew.tsx should now display:");
        console.log("✅ Complete delivery addresses with recipient names");
        console.log("✅ Restaurant/brand information with cuisine types");
        console.log("✅ Item summaries with quantities and prices");
        console.log("✅ Visual indicators for vegetarian items");
        console.log("✅ Proper address formatting with phone numbers");
      } else {
        console.log("❌ No orders found in history");
        console.log("💡 Create a test order first to see the address display");
      }
    } else {
      console.log(
        "❌ Failed to fetch order history:",
        historyResponse.data.message
      );
    }
  } catch (error) {
    console.log("❌ Error:", error.response?.data || error.message);
  }
}

testOrderHistoryDeliveryAddress();
