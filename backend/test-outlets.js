const axios = require("axios");

async function testAdminOutlets() {
  try {
    console.log("🔐 Testing admin outlets endpoint...");

    // Login first to get a real token
    const loginResponse = await axios.post(
      "http://localhost:5000/api/admin/login",
      {
        email: "admin@globaleats.com",
        password: "admin123",
      }
    );

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log("✅ Login successful, testing outlets...");

      // Test outlets endpoint
      const outletsResponse = await axios.get(
        "http://localhost:5000/api/admin/outlets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Outlets response structure:");
      console.log("- Success:", outletsResponse.data.success);
      console.log(
        "- Data type:",
        Array.isArray(outletsResponse.data.data)
          ? "Array"
          : typeof outletsResponse.data.data
      );
      console.log(
        "- Data length:",
        outletsResponse.data.data ? outletsResponse.data.data.length : "null"
      );
      console.log(
        "- Sample data:",
        JSON.stringify(outletsResponse.data, null, 2)
      );
    } else {
      console.log("❌ Login failed:", loginResponse.data.message);
    }
  } catch (error) {
    console.error("❌ Test error:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
  }
}

testAdminOutlets();
