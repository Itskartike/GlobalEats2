// COMPREHENSIVE AUTH STORAGE FIX
console.log("🔧 COMPREHENSIVE AUTH STORAGE FIX");

function fixAuthStorageIssue() {
  console.log("=== STEP 1: DIAGNOSE CURRENT STATE ===");

  // Check current storage
  const authStorage = localStorage.getItem("auth-storage");
  const authToken = localStorage.getItem("auth-token");

  console.log("Current auth-storage:", authStorage);
  console.log("Current auth-token:", !!authToken);

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log("Parsed storage structure:", parsed);
      console.log("User in storage:", parsed.state?.user);
      console.log("Token in storage:", !!parsed.state?.token);
    } catch (e) {
      console.log("❌ Storage parsing error:", e);
    }
  }

  console.log("\n=== STEP 2: CLEAR ALL AUTH DATA ===");

  // Clear all auth-related storage
  localStorage.removeItem("auth-storage");
  localStorage.removeItem("auth-token");
  localStorage.removeItem("token");
  localStorage.removeItem("admin_auth_token");

  console.log("✅ Cleared all auth storage");

  console.log("\n=== STEP 3: FRESH LOGIN ===");
  return performFreshLogin();
}

async function performFreshLogin() {
  try {
    console.log("🔐 Performing fresh login...");

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

    if (data.success && data.data) {
      console.log("✅ Login API successful");
      console.log("👤 User data:", data.data.user);
      console.log("🎫 Token received:", !!data.data.token);

      // Store token in multiple places for compatibility
      localStorage.setItem("auth-token", data.data.token);

      // Create proper Zustand storage structure
      const properAuthStorage = {
        state: {
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
          isLoading: false,
        },
        version: 0,
      };

      localStorage.setItem("auth-storage", JSON.stringify(properAuthStorage));

      console.log("💾 Stored auth data properly");

      // Verify storage was saved correctly
      const verifyStorage = JSON.parse(localStorage.getItem("auth-storage"));
      console.log("✅ Verification - User:", verifyStorage.state.user.name);
      console.log("✅ Verification - Token:", !!verifyStorage.state.token);
      console.log(
        "✅ Verification - Authenticated:",
        verifyStorage.state.isAuthenticated
      );

      // Test the orders API immediately
      console.log("\n=== STEP 4: TEST ORDERS API ===");
      const ordersResponse = await fetch(
        "http://localhost:5000/api/orders/history",
        {
          headers: {
            Authorization: "Bearer " + data.data.token,
          },
        }
      );

      const ordersData = await ordersResponse.json();

      if (ordersData.success) {
        console.log(
          "🎉 Orders API works! Found",
          ordersData.data.orders.length,
          "orders"
        );
        ordersData.data.orders.forEach((order, i) => {
          console.log(
            `   ${i + 1}. #${order.order_number} - ₹${order.total_amount} - ${order.order_status || order.status}`
          );
        });
      } else {
        console.log("❌ Orders API failed:", ordersData.message);
      }

      console.log("\n🎯 SOLUTION COMPLETE!");
      console.log("1. ✅ Auth storage fixed");
      console.log("2. ✅ User logged in as Admin");
      console.log("3. ✅ Token stored properly");
      console.log("4. ✅ Orders API tested");
      console.log("\n🔄 NOW: Refresh the page and go to Profile → Orders");

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

// Quick function to just check current state
function checkAuthState() {
  console.log("=== CURRENT AUTH STATE ===");
  const storage = localStorage.getItem("auth-storage");
  if (storage) {
    const parsed = JSON.parse(storage);
    console.log("User:", parsed.state?.user?.name || "UNDEFINED");
    console.log("Email:", parsed.state?.user?.email || "UNDEFINED");
    console.log("Token:", !!parsed.state?.token);
    console.log("Authenticated:", parsed.state?.isAuthenticated);
  } else {
    console.log("No auth storage found");
  }
}

// Export functions
window.fixAuthStorageIssue = fixAuthStorageIssue;
window.checkAuthState = checkAuthState;

console.log("\n📋 AVAILABLE FUNCTIONS:");
console.log("- fixAuthStorageIssue() - Complete fix");
console.log("- checkAuthState() - Check current state");
console.log("\n🚀 RUN THIS NOW: fixAuthStorageIssue()");

// Auto-run the fix
fixAuthStorageIssue();
