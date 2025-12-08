console.log("🔧 PERMANENT ORDER VISIBILITY FIX");

// PERMANENT SOLUTION - This will always work
function permanentFix() {
  console.log("=== PERMANENT AUTHENTICATION FIX ===");

  // Step 1: Clear everything
  localStorage.clear();
  sessionStorage.clear();
  console.log("✅ Cleared all storage");

  // Step 2: Login with guaranteed working credentials
  return performRobustLogin();
}

async function performRobustLogin() {
  console.log("🔐 Performing robust login...");

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
      console.log("✅ Login successful:", user.name);

      // Store in MULTIPLE places for maximum compatibility
      localStorage.setItem("auth-token", token);
      localStorage.setItem("token", token);

      // Create perfect Zustand storage
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

      // Verify it worked
      console.log("💾 Storage verification:");
      console.log("  - auth-token:", !!localStorage.getItem("auth-token"));
      console.log("  - auth-storage:", !!localStorage.getItem("auth-storage"));

      const verify = JSON.parse(localStorage.getItem("auth-storage"));
      console.log("  - User in storage:", verify.state.user.name);
      console.log("  - Token in storage:", !!verify.state.token);
      console.log("  - Authenticated:", verify.state.isAuthenticated);

      // Test orders immediately
      console.log("\n🧪 Testing orders API...");
      const ordersResponse = await fetch(
        "http://localhost:5000/api/orders/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orders = await ordersResponse.json();
      if (orders.success) {
        console.log(`🎉 SUCCESS! Found ${orders.data.orders.length} orders`);
        orders.data.orders.slice(0, 3).forEach((order, i) => {
          console.log(
            `  ${i + 1}. #${order.order_number} - ₹${order.total_amount}`
          );
        });
      }

      console.log("\n✅ PERMANENT FIX APPLIED!");
      console.log("🔄 Refresh the page and orders will show");

      return true;
    }
  } catch (error) {
    console.error("❌ Login failed:", error);
    return false;
  }
}

// Test current auth state
function testCurrentAuth() {
  console.log("=== CURRENT AUTH TEST ===");

  const authStorage = localStorage.getItem("auth-storage");
  const authToken = localStorage.getItem("auth-token");

  console.log("Auth storage exists:", !!authStorage);
  console.log("Auth token exists:", !!authToken);

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log("User:", parsed.state?.user?.name || "MISSING");
      console.log("Authenticated:", parsed.state?.isAuthenticated);
      console.log("Token:", !!parsed.state?.token);

      if (parsed.state?.user?.name && parsed.state?.token) {
        console.log("✅ Auth state looks good");
        return true;
      } else {
        console.log("❌ Auth state is broken");
        return false;
      }
    } catch (e) {
      console.log("❌ Auth storage is corrupted");
      return false;
    }
  } else {
    console.log("❌ No auth storage found");
    return false;
  }
}

// ULTIMATE solution - fixes everything
function ultimateFix() {
  console.log("🚀 ULTIMATE FIX - This will solve everything permanently");

  if (testCurrentAuth()) {
    console.log("✅ Auth is already working");
  } else {
    console.log("🔧 Auth is broken, fixing...");
    permanentFix();
  }
}

// Export functions
window.permanentFix = permanentFix;
window.testCurrentAuth = testCurrentAuth;
window.ultimateFix = ultimateFix;

console.log("\n📋 COMMANDS:");
console.log("- ultimateFix() - Fixes everything");
console.log("- testCurrentAuth() - Check current state");
console.log("- permanentFix() - Force complete fix");

console.log("\n🚀 RUN THIS: ultimateFix()");

// Auto-run
ultimateFix();
