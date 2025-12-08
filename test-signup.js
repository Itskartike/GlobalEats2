// Test signup API directly
const axios = require("axios");

async function testSignup() {
  try {
    const testUser = {
      name: "Test User " + Date.now(),
      email: "testuser" + Date.now() + "@example.com",
      phone: "1234567" + Date.now().toString().slice(-3),
      password: "testpassword123",
    };

    console.log("Testing signup with:", testUser);

    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      testUser
    );

    console.log("✅ Signup successful!");
    console.log("Response:", response.data);
    console.log("User ID:", response.data.data?.user?.id);
    console.log(
      "Token:",
      response.data.data?.token ? "Generated" : "Not generated"
    );

    // Now test database to see if user was saved
    const checkResponse = await axios.get(`http://localhost:5000/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${response.data.data.token}`,
      },
    });

    console.log("✅ User verification successful!");
    console.log("User in DB:", checkResponse.data);
  } catch (error) {
    console.error("❌ Signup test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testSignup();
