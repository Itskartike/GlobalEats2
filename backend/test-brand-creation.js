const axios = require("axios");

async function testBrandCreation() {
  try {
    // Login first
    console.log("🔐 Logging in...");
    const loginRes = await axios.post("http://localhost:5000/api/admin/login", {
      email: "admin@globaleats.com",
      password: "admin123",
    });

    const token = loginRes.data.data.token;
    console.log("✅ Login successful");

    // Try to create a brand
    console.log("➕ Creating test brand...");
    const brandData = {
      name: "Test Brand API",
      description: "Test Description for API",
      cuisine_type: "Fast Food",
      minimum_order_amount: 100,
      delivery_fee: 25,
      estimated_delivery_time: 30,
      is_active: true,
      is_featured: false,
    };

    const brandRes = await axios.post(
      "http://localhost:5000/api/admin/brands",
      brandData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Brand created successfully:", brandRes.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    if (error.response?.data) {
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
  }
}

testBrandCreation();
