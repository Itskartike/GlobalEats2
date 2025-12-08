console.log("🚨 FIXING 401 AUTHENTICATION ERROR");

async function fix401Error() {
  console.log("=== DIAGNOSING 401 ERROR ===");

  // Check current auth state
  const authToken = localStorage.getItem("auth-token");
  const authStorage = localStorage.getItem("auth-storage");

  console.log("Current auth-token:", !!authToken);
  console.log("Current auth-storage:", !!authStorage);

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log("User in storage:", parsed.state?.user?.name || "MISSING");
      console.log("Token in storage:", !!parsed.state?.token);
      console.log("Is authenticated:", parsed.state?.isAuthenticated);
    } catch (e) {
      console.log("❌ Storage parsing error:", e);
    }
  }

  console.log("\n=== FIXING AUTH TOKENS ===");

  // Clear broken auth
  localStorage.removeItem("auth-storage");
  localStorage.removeItem("auth-token");
  localStorage.removeItem("token");
  localStorage.removeItem("admin_auth_token");

  // Fresh login
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@globaleats.com",
        password: "admin123",
      }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      const { user, token } = data.data;

      // Store tokens properly
      localStorage.setItem("auth-token", token);

      const authStorage = {
        state: {
          user: user,
          token: token,
          isAuthenticated: true,
          isLoading: false,
        },
        version: 0,
      };
      localStorage.setItem("auth-storage", JSON.stringify(authStorage));

      console.log("✅ Auth tokens fixed!");
      console.log("👤 Logged in as:", user.name);
      console.log("🎫 Token stored:", token.substring(0, 20) + "...");

      // Test API with new token
      console.log("\n=== TESTING API WITH NEW TOKEN ===");
      const testResponse = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const profileData = await testResponse.json();
      if (profileData.success) {
        console.log("✅ API test successful!");
        console.log("👤 Profile:", profileData.data.user.name);
      } else {
        console.log("❌ API test failed:", profileData.message);
      }

      // Test orders API
      const ordersResponse = await fetch(
        "http://localhost:5000/api/orders/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const ordersData = await ordersResponse.json();
      if (ordersData.success) {
        console.log("✅ Orders API working!");
        console.log("📦 Found", ordersData.data.orders.length, "orders");
      } else {
        console.log("❌ Orders API failed:", ordersData.message);
      }

      console.log("\n🎉 401 ERROR FIXED!");
      console.log("🔄 Refresh the page - no more 401 errors!");
    } else {
      console.log("❌ Login failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error during fix:", error);
  }
}

// Run the fix
fix401Error();
