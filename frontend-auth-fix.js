console.log("🔧 FIXING AUTH STORAGE ISSUE");

// Fix the broken auth storage
function fixAuthStorage() {
  console.log("=== FIXING BROKEN AUTH STORAGE ===");

  // Clear broken storage
  localStorage.removeItem("auth-storage");
  localStorage.removeItem("auth-token");
  console.log("✅ Cleared broken auth storage");

  // Login as admin with proper token storage
  quickLoginAdmin();
}

// Auto-login as admin for quick testing
async function quickLoginAdmin() {
  console.log("\n=== LOGGING IN AS ADMIN ===");

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@globaleats.com",
        password: "admin123",
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Admin login successful!");
      console.log("👤 User:", data.data.user.name);
      console.log("📧 Email:", data.data.user.email);

      // Store tokens properly
      localStorage.setItem("auth-token", data.data.token);

      const authStorageData = {
        state: {
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem("auth-storage", JSON.stringify(authStorageData));

      console.log("💾 Tokens stored successfully");

      // Test API immediately
      console.log("\n=== TESTING ORDER API ===");
      const ordersResponse = await fetch(
        "http://localhost:5000/api/orders/history",
        {
          headers: {
            Authorization: "Bearer " + data.data.token,
            "Content-Type": "application/json",
          },
        }
      );

      const ordersData = await ordersResponse.json();
      console.log("📊 Orders API Response:", ordersData);

      if (ordersData.success && ordersData.data) {
        console.log(
          "🎉 SUCCESS! Found",
          ordersData.data.orders.length,
          "orders"
        );
        console.log(
          "📦 Orders:",
          ordersData.data.orders.map(
            (o) => `#${o.order_number} - ₹${o.total_amount}`
          )
        );
      }

      console.log("\n🔄 Now refresh the page and go to Profile → Orders");
      console.log(
        "✅ You should see",
        ordersData.data?.orders.length || 0,
        "orders to cancel!"
      );

      return true;
    } else {
      console.log("❌ Login failed:", data.message);
      return false;
    }
  } catch (error) {
    console.error("🚫 Login error:", error);
    return false;
  }
}

// Export functions
window.fixAuthStorage = fixAuthStorage;
window.quickLoginAdmin = quickLoginAdmin;

console.log("🚀 IMMEDIATE FIX:");
console.log("Run: fixAuthStorage()");

// Auto-fix
fixAuthStorage();
