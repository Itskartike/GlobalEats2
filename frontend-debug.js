// Add this to your browser console to test frontend authentication
console.log("🔧 FRONTEND DEBUG SCRIPT LOADED");

// Function to check authentication state
function checkAuthState() {
  console.log("=== AUTHENTICATION STATE CHECK ===");

  // Check localStorage tokens
  const authToken = localStorage.getItem("auth-token");
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("admin_auth_token");

  console.log("📦 LocalStorage tokens:", {
    "auth-token": !!authToken,
    token: !!token,
    admin_auth_token: !!adminToken,
  });

  // Check Zustand auth storage
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log("🏪 Zustand auth-storage:", {
        hasState: !!parsed.state,
        hasUser: !!parsed.state?.user,
        hasToken: !!parsed.state?.token,
        isAuthenticated: parsed.state?.isAuthenticated,
        userName: parsed.state?.user?.name,
        userEmail: parsed.state?.user?.email,
      });
    } catch (e) {
      console.error("❌ Failed to parse auth-storage:", e);
    }
  } else {
    console.log("❌ No auth-storage found in localStorage");
  }
}

// Function to test login with Admin credentials
async function testAdminLogin() {
  console.log("=== TESTING ADMIN LOGIN ===");

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
      console.log("🎫 Token received:", !!data.data.token);

      // Store tokens like the frontend would
      localStorage.setItem("auth-token", data.data.token);

      // Also update Zustand storage
      const authStorageData = {
        state: {
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem("auth-storage", JSON.stringify(authStorageData));

      console.log("💾 Tokens stored in localStorage and Zustand storage");
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

// Function to test order history API
async function testOrderHistory() {
  console.log("=== TESTING ORDER HISTORY API ===");

  const token = localStorage.getItem("auth-token");
  if (!token) {
    console.log("❌ No token found, please login first");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/orders/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Order history fetched successfully!");
      console.log("📦 Orders count:", data.data.orders.length);
      console.log("📄 Pagination:", data.data.pagination);

      if (data.data.orders.length > 0) {
        console.log("📋 Sample order:", {
          id: data.data.orders[0].id,
          total: data.data.orders[0].total_amount,
          status: data.data.orders[0].order_status,
          date: new Date(data.data.orders[0].created_at).toLocaleDateString(),
        });
      }
    } else {
      console.log("❌ Failed to fetch orders:", data.message);
    }
  } catch (error) {
    console.error("🚫 Order history error:", error);
  }
}

// Main debug function
async function runFullDebug() {
  console.log("🚀 STARTING FULL DEBUG...");

  checkAuthState();

  const loginSuccess = await testAdminLogin();

  if (loginSuccess) {
    console.log("\n⏳ Waiting 1 second...");
    setTimeout(() => {
      checkAuthState();
      testOrderHistory();
    }, 1000);
  }

  console.log("\n📋 INSTRUCTIONS:");
  console.log("1. After running this script, refresh the page");
  console.log("2. Go to Profile page (should show Admin User logged in)");
  console.log("3. Click on Orders tab to see order history");
  console.log(
    "4. If it still doesn't work, check the Network tab for API calls"
  );
}

// Export functions for manual use
window.debugAuth = {
  checkAuthState,
  testAdminLogin,
  testOrderHistory,
  runFullDebug,
};

console.log("🔧 AVAILABLE DEBUG FUNCTIONS:");
console.log("- debugAuth.checkAuthState() - Check current auth state");
console.log("- debugAuth.testAdminLogin() - Login as admin");
console.log("- debugAuth.testOrderHistory() - Test order history API");
console.log("- debugAuth.runFullDebug() - Run complete debug flow");
console.log("\nTo run full debug: debugAuth.runFullDebug()");
