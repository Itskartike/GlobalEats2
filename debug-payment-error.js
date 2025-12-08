const axios = require("axios");

async function debugPaymentError() {
  console.log("🐛 Debugging Payment Error...\n");

  const baseURL = "http://localhost:5000/api";

  // Test 1: Check if server is running
  try {
    console.log("1. Testing server connection...");
    const healthCheck = await axios.get(`${baseURL}/test/health`);
    console.log("✅ Server is running:", healthCheck.data);
  } catch (error) {
    console.log("❌ Server connection failed:", error.message);
    return;
  }

  // Test 2: Try to login
  try {
    console.log("\n2. Testing login...");
    const loginData = {
      email: "kartik@test.com",
      password: "kartik123",
    };
    const loginResponse = await axios.post(`${baseURL}/auth/login`, loginData);
    const token = loginResponse.data.data.token;
    console.log("✅ Login successful, token length:", token.length);

    // Test 3: Create a test order
    console.log("\n3. Testing order creation...");
    const orderData = {
      brands: [
        {
          brandId: "brand-1",
          outletId: "outlet-1",
          items: [
            {
              menuItemId: "item-1",
              quantity: 1,
            },
          ],
        },
      ],
      deliveryAddress: {
        street: "123 Test St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      paymentMethod: "online",
    };

    const orderResponse = await axios.post(`${baseURL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (
      orderResponse.data.success &&
      orderResponse.data.data.orders.length > 0
    ) {
      const orderId = orderResponse.data.data.orders[0].id;
      console.log("✅ Order created successfully:", orderId);

      // Test 4: Try to create payment
      console.log("\n4. Testing payment creation...");
      const paymentResponse = await axios.post(
        `${baseURL}/payments/create-order`,
        {
          orderId: orderId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Payment creation successful:", paymentResponse.data);
    } else {
      console.log("❌ Order creation failed:", orderResponse.data);
    }
  } catch (error) {
    console.log("❌ Error during testing:");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else {
      console.log("Message:", error.message);
    }
  }
}

debugPaymentError();
