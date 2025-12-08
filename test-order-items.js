const axios = require("axios");

async function testOrderItems() {
  console.log("🧪 Testing Order Items Display...\n");

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

    // Get order history to find an existing order
    console.log("\n2. Fetching order history...");
    const historyResponse = await axios.get(
      `${baseURL}/orders/history?limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (
      historyResponse.data.success &&
      historyResponse.data.data.orders.length > 0
    ) {
      const orderId = historyResponse.data.data.orders[0].id;
      console.log("✅ Found order:", orderId);

      // Get order details
      console.log("\n3. Fetching order details...");
      const detailsResponse = await axios.get(`${baseURL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (detailsResponse.data.success) {
        const order = detailsResponse.data.data;
        console.log("✅ Order details fetched");
        console.log("\n📊 Order Structure:");
        console.log("- Order ID:", order.id);
        console.log("- Order Items Count:", order.orderItems?.length || 0);

        if (order.orderItems && order.orderItems.length > 0) {
          console.log("\n🍽️ First Order Item:");
          const firstItem = order.orderItems[0];
          console.log("- Item ID:", firstItem.id);
          console.log("- Menu Item ID:", firstItem.menu_item_id);
          console.log("- Quantity:", firstItem.quantity);
          console.log("- Unit Price:", firstItem.unit_price);
          console.log("- Menu Item Name:", firstItem.menuItem?.name || "N/A");
          console.log(
            "- Menu Item Price:",
            firstItem.menuItem?.base_price || "N/A"
          );

          console.log("\n🔧 Expected Frontend Structure:");
          const processedItem = {
            id: firstItem.id || firstItem.menu_item_id,
            menuItemId: firstItem.menu_item_id,
            name: firstItem.menuItem?.name || firstItem.name || "Item",
            quantity: firstItem.quantity || 1,
            price: parseFloat(
              firstItem.unit_price ||
                firstItem.price ||
                firstItem.menuItem?.base_price ||
                0
            ),
            specialInstructions:
              firstItem.special_instructions || firstItem.specialInstructions,
            image: firstItem.menuItem?.image_url || firstItem.menuItem?.image,
          };
          console.log("Processed Item:", processedItem);

          if (!processedItem.name || processedItem.name === "Item") {
            console.log("\n❌ PROBLEM FOUND: Menu item name is missing!");
            console.log(
              "Raw menuItem object:",
              JSON.stringify(firstItem.menuItem, null, 2)
            );
          } else {
            console.log("\n✅ Item processing looks correct");
          }
        } else {
          console.log("\n❌ PROBLEM: No order items found!");
        }
      } else {
        console.log(
          "❌ Failed to fetch order details:",
          detailsResponse.data.message
        );
      }
    } else {
      console.log("❌ No orders found in history");
    }
  } catch (error) {
    console.log("❌ Error:", error.response?.data || error.message);
  }
}

testOrderItems();
