console.log("🔧 QUICK ORDER DEBUG SCRIPT");

// Function to test order visibility
function debugOrders() {
  console.log("=== DEBUGGING ORDER VISIBILITY ===");

  // Check authentication
  const authStorage = localStorage.getItem("auth-storage");
  const authToken = localStorage.getItem("auth-token");

  console.log("1. AUTH CHECK:");
  console.log("   - auth-token:", !!authToken);
  console.log("   - auth-storage:", !!authStorage);

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log("   - User:", parsed.state?.user?.name);
      console.log("   - Email:", parsed.state?.user?.email);
      console.log("   - Authenticated:", parsed.state?.isAuthenticated);
    } catch (e) {
      console.log("   - Error parsing auth storage");
    }
  }

  // Test API directly
  console.log("\n2. TESTING API DIRECTLY:");
  const finalToken =
    authToken || (authStorage ? JSON.parse(authStorage).state?.token : null);

  if (finalToken) {
    fetch("http://localhost:5000/api/orders/history", {
      headers: {
        Authorization: "Bearer " + finalToken,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("   - Response status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("   - API Response:", data);
        if (data.success && data.data) {
          console.log("   - Orders found:", data.data.orders.length);
          if (data.data.orders.length === 0) {
            console.log(
              "   ❌ USER HAS NO ORDERS - THIS IS WHY ORDERS AREN'T SHOWING!"
            );
            console.log(
              "   💡 SOLUTION: Login with admin@globaleats.com / admin123"
            );
          } else {
            console.log(
              "   ✅ Orders exist - there might be a frontend display bug"
            );
          }
        }
      })
      .catch((error) => {
        console.error("   - API Error:", error);
      });
  } else {
    console.log("   ❌ NO TOKEN FOUND - USER NOT LOGGED IN!");
    console.log("   💡 SOLUTION: Login first");
  }
}

// Auto-login as admin for quick testing
async function quickLoginAdmin() {
  console.log("\n=== QUICK ADMIN LOGIN ===");

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

      // Store tokens
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
      console.log("🔄 Now refresh the page and go to Profile → Orders");

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
window.debugOrders = debugOrders;
window.quickLoginAdmin = quickLoginAdmin;

console.log("📋 AVAILABLE FUNCTIONS:");
console.log("- debugOrders() - Check why orders aren't showing");
console.log("- quickLoginAdmin() - Login as admin (who has 7 orders)");
console.log("");
console.log("🚀 RUN THIS NOW: quickLoginAdmin()");

// Auto-run debug
debugOrders();
