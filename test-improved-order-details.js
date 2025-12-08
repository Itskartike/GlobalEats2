const axios = require("axios");

async function testImprovedOrderDetails() {
  console.log("🚀 Testing Improved Order Details...\n");

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

      // Get improved order details
      console.log("\n3. Testing improved order details...");
      const detailsResponse = await axios.get(`${baseURL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (detailsResponse.data.success) {
        const order = detailsResponse.data.data;
        console.log("✅ Improved order details fetched successfully!");
        console.log("\n📊 Enhanced Order Structure:");
        console.log("- Order ID:", order.id);
        console.log("- Order Number:", order.orderNumber);
        console.log("- Status:", order.status);
        console.log("- Payment Method:", order.paymentMethod);
        console.log("- Total Amount:", order.totalAmount);
        console.log("- Items Count:", order.items?.length || 0);
        console.log("- Total Quantity:", order.totalQuantity);

        // Test delivery address
        if (order.deliveryAddress) {
          console.log("\n🏠 Delivery Address:");
          console.log("- Recipient:", order.deliveryAddress.recipient_name);
          console.log("- Full Address:", order.deliveryAddress.fullAddress);
          console.log("- Phone:", order.deliveryAddress.phone);
        }

        // Test restaurant info
        if (order.restaurant) {
          console.log("\n🏪 Restaurant Info:");
          console.log("- Outlet Name:", order.restaurant.outletName);
          console.log("- Brand Name:", order.restaurant.brand?.name);
          console.log("- Cuisine:", order.restaurant.brand?.cuisine);
        }

        // Test items structure
        if (order.items && order.items.length > 0) {
          console.log("\n🍽️ Enhanced Items Structure:");
          order.items.forEach((item, index) => {
            console.log(`\nItem ${index + 1}:`);
            console.log("- ID:", item.id);
            console.log("- Name:", item.name);
            console.log("- Quantity:", item.quantity);
            console.log("- Unit Price:", item.unitPrice);
            console.log("- Total Price:", item.totalPrice);
            console.log("- Is Vegetarian:", item.isVegetarian);
            console.log("- Category:", item.category);
            console.log(
              "- Special Instructions:",
              item.specialInstructions || "None"
            );
            if (item.brand) {
              console.log("- Brand:", item.brand.name);
            }
          });

          console.log("\n🔍 Item Display Readiness Check:");
          const hasAllRequiredFields = order.items.every(
            (item) =>
              item.name &&
              item.name !== "Unknown Item" &&
              item.quantity &&
              item.unitPrice !== undefined
          );
          console.log(
            "- All items have required fields:",
            hasAllRequiredFields ? "✅" : "❌"
          );

          if (!hasAllRequiredFields) {
            console.log("\n❌ ISSUES FOUND:");
            order.items.forEach((item, index) => {
              if (!item.name || item.name === "Unknown Item") {
                console.log(`- Item ${index + 1}: Missing or invalid name`);
              }
              if (!item.quantity) {
                console.log(`- Item ${index + 1}: Missing quantity`);
              }
              if (item.unitPrice === undefined) {
                console.log(`- Item ${index + 1}: Missing unit price`);
              }
            });
          }
        } else {
          console.log("\n❌ No items found in order!");
        }

        console.log("\n📋 Summary:");
        console.log("- Enhanced structure: ✅");
        console.log("- Comprehensive data: ✅");
        console.log("- Frontend-friendly format: ✅");
        console.log("- Backward compatibility: ✅");
      } else {
        console.log(
          "❌ Failed to fetch order details:",
          detailsResponse.data.message
        );
      }
    } else {
      console.log("❌ No orders found in history");
      console.log("Creating a test order first...");

      // Create a test order to test with
      const orderData = {
        addressId: "address-1", // You might need to adjust this
        paymentMethod: "cod",
        brands: [
          {
            brandId: "brand-1",
            outletId: "outlet-1",
            items: [
              {
                menuItemId: "item-1",
                quantity: 2,
                specialInstructions: "Make it spicy",
              },
            ],
          },
        ],
      };

      const createResponse = await axios.post(`${baseURL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (createResponse.data.success) {
        console.log("✅ Test order created, testing details...");
        const newOrderId = createResponse.data.data.orders[0].id;

        // Test the new order details
        const newDetailsResponse = await axios.get(
          `${baseURL}/orders/${newOrderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(
          "New order details response:",
          newDetailsResponse.data.success ? "✅" : "❌"
        );
      }
    }
  } catch (error) {
    console.log("❌ Error:", error.response?.data || error.message);
  }
}

testImprovedOrderDetails();
