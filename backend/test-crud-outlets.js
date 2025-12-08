const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

// Test admin credentials
const adminCredentials = {
  email: "admin@globaleats.com",
  password: "admin123",
};

let authToken = "";
let testOutletId = "";

async function login() {
  try {
    console.log("🔐 Logging in as admin...");
    const response = await axios.post(
      `${API_BASE}/admin/login`,
      adminCredentials
    );

    if (response.data.success) {
      authToken = response.data.data.token;
      console.log("✅ Admin login successful");
      return true;
    }
    console.error("❌ Login failed:", response.data.message);
    return false;
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    return false;
  }
}

async function testRead() {
  try {
    console.log("\n📖 Testing READ operation (Get all outlets)...");
    const response = await axios.get(`${API_BASE}/admin/outlets`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(
        `✅ READ successful - Found ${response.data.data.length} outlets`
      );
      console.log(
        "   Sample outlet:",
        response.data.data[0]?.name || "No outlets found"
      );
      return true;
    }
    console.error("❌ READ failed - Invalid response structure");
    return false;
  } catch (error) {
    console.error("❌ READ error:", error.response?.data || error.message);
    return false;
  }
}

async function testCreate() {
  try {
    console.log("\n➕ Testing CREATE operation...");
    const newOutlet = {
      name: "Test Outlet - CRUD Test",
      brand_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // McDonald's brand ID
      address: "123 Test Street, Test City",
      city: "Test City",
      state: "Test State",
      postal_code: "12345",
      latitude: 12.9716,
      longitude: 77.5946,
      phone: "+91 80 9999 9999",
      email: "test@testoutlet.com",
      delivery_radius: 8,
      is_active: true,
    };

    const response = await axios.post(`${API_BASE}/admin/outlets`, newOutlet, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && response.data.data) {
      testOutletId = response.data.data.id;
      console.log("✅ CREATE successful - New outlet ID:", testOutletId);
      console.log("   Created outlet name:", response.data.data.name);
      return true;
    }
    console.error("❌ CREATE failed:", response.data);
    return false;
  } catch (error) {
    console.error("❌ CREATE error:", error.response?.data || error.message);
    return false;
  }
}

async function testUpdate() {
  try {
    console.log("\n✏️ Testing UPDATE operation...");
    const updateData = {
      name: "Test Outlet - UPDATED",
      address: "456 Updated Street, Updated City",
      city: "Updated City",
      phone: "+91 80 8888 8888",
      delivery_radius: 10,
      is_active: true,
    };

    const response = await axios.put(
      `${API_BASE}/admin/outlets/${testOutletId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      console.log("✅ UPDATE successful");
      console.log("   Updated outlet name:", response.data.data?.name);
      return true;
    }
    console.error("❌ UPDATE failed:", response.data);
    return false;
  } catch (error) {
    console.error("❌ UPDATE error:", error.response?.data || error.message);
    return false;
  }
}

async function testReadSingle() {
  try {
    console.log("\n🔍 Testing READ SINGLE operation...");
    const response = await axios.get(
      `${API_BASE}/admin/outlets/${testOutletId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success && response.data.data) {
      console.log("✅ READ SINGLE successful");
      console.log("   Outlet name:", response.data.data.name);
      console.log("   Updated address:", response.data.data.address);
      return true;
    }
    console.error("❌ READ SINGLE failed:", response.data);
    return false;
  } catch (error) {
    console.error(
      "❌ READ SINGLE error:",
      error.response?.data || error.message
    );
    return false;
  }
}

async function testDelete() {
  try {
    console.log("\n🗑️ Testing DELETE operation...");
    const response = await axios.delete(
      `${API_BASE}/admin/outlets/${testOutletId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      console.log("✅ DELETE successful");
      return true;
    }
    console.error("❌ DELETE failed:", response.data);
    return false;
  } catch (error) {
    console.error("❌ DELETE error:", error.response?.data || error.message);
    return false;
  }
}

async function testBrandsEndpoint() {
  try {
    console.log("\n🏢 Testing Brands endpoint...");
    const response = await axios.get(`${API_BASE}/admin/brands`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(
        `✅ Brands endpoint successful - Found ${response.data.data.length} brands`
      );
      console.log(
        "   Sample brand:",
        response.data.data[0]?.name || "No brands found"
      );
      return true;
    }
    console.error("❌ Brands endpoint failed");
    return false;
  } catch (error) {
    console.error(
      "❌ Brands endpoint error:",
      error.response?.data || error.message
    );
    return false;
  }
}

async function runAllTests() {
  console.log("🧪 Starting CRUD Operations Test for Outlets Admin API\n");

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("\n❌ Test suite failed - Could not login");
    return;
  }

  const results = {
    read: await testRead(),
    brands: await testBrandsEndpoint(),
    create: await testCreate(),
    update: testOutletId ? await testUpdate() : false,
    readSingle: testOutletId ? await testReadSingle() : false,
    delete: testOutletId ? await testDelete() : false,
  };

  console.log("\n📋 Test Results Summary:");
  console.log("========================");
  Object.entries(results).forEach(([operation, success]) => {
    const status = success ? "✅ PASS" : "❌ FAIL";
    console.log(`${operation.toUpperCase().padEnd(12)} : ${status}`);
  });

  const allPassed = Object.values(results).every((result) => result);
  console.log(
    "\n🏆 Overall Result:",
    allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
  );

  if (allPassed) {
    console.log("\n🎉 All CRUD operations are working correctly!");
    console.log("   The admin outlets management system is fully functional.");
  } else {
    console.log("\n⚠️ Some operations failed. Please check the errors above.");
  }
}

// Run the tests
runAllTests().catch(console.error);
