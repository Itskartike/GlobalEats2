const axios = require("axios");

const API_BASE = "http://localhost:5000/api";
const adminCredentials = {
  email: "admin@globaleats.com",
  password: "admin123",
};

async function testCategoriesAPI() {
  try {
    console.log("🔐 Logging in as admin...");
    const loginResponse = await axios.post(
      `${API_BASE}/admin/login`,
      adminCredentials
    );

    if (!loginResponse.data.success) {
      console.error("❌ Login failed:", loginResponse.data.message);
      return;
    }

    const authToken = loginResponse.data.data.token;
    console.log("✅ Admin login successful");

    console.log("\n📋 Testing Categories API...");
    const categoriesResponse = await axios.get(`${API_BASE}/admin/categories`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Categories API response:", categoriesResponse.data);

    if (categoriesResponse.data.success) {
      console.log(
        `📊 Found ${categoriesResponse.data.data.length} categories:`
      );
      categoriesResponse.data.data.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name} (ID: ${category.id})`);
      });
    }

    console.log("\n🏢 Testing Brands API...");
    const brandsResponse = await axios.get(`${API_BASE}/admin/brands`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Brands API response:", brandsResponse.data);

    if (brandsResponse.data.success) {
      console.log(`📊 Found ${brandsResponse.data.data.length} brands:`);
      brandsResponse.data.data.forEach((brand, index) => {
        console.log(
          `   ${index + 1}. ${brand.name} (Categories: ${brand.categories?.length || 0})`
        );
        if (brand.categories && brand.categories.length > 0) {
          brand.categories.forEach((cat) => {
            console.log(`      - ${cat.name}`);
          });
        }
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testCategoriesAPI();
