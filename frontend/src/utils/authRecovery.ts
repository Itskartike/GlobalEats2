/**
 * Authentication Recovery Utility
 * 
 * Handles scenarios where temp files/localStorage gets cleared
 * and helps users recover their authentication state
 */

export const AuthRecovery = {
  /**
   * Check if authentication tokens are missing (likely due to temp file cleanup)
   */
  isAuthDataMissing(): boolean {
    const authToken = localStorage.getItem("auth-token");
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("admin_auth_token");
    const authStorage = localStorage.getItem("auth-storage");
    
    let hasPersistedAuth = false;
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        hasPersistedAuth = !!parsed.state?.token;
      } catch (e) {
        console.warn("Failed to parse auth-storage", e);
      }
    }
    
    return !authToken && !token && !adminToken && !hasPersistedAuth;
  },

  /**
   * Show user-friendly message about session loss
   */
  showSessionLostMessage(): void {
    // Silently redirect to login without popup
    console.log("🔒 Session lost - redirecting to login page");
    this.redirectToLogin();
  },

  /**
   * Redirect to login page
   */
  redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  /**
   * Clear all authentication data
   */
  clearAllAuthData(): void {
    // Clear localStorage tokens
    localStorage.removeItem("auth-token");
    localStorage.removeItem("token");
    localStorage.removeItem("admin_auth_token");
    localStorage.removeItem("refresh-token");
    
    // Clear Zustand persist storage
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state) {
          parsed.state.user = null;
          parsed.state.token = null;
          parsed.state.isAuthenticated = false;
          localStorage.setItem("auth-storage", JSON.stringify(parsed));
        }
      } catch (err) {
        console.error("Error clearing auth-storage:", err);
        localStorage.removeItem("auth-storage");
      }
    }
    
    console.log("🧹 Cleared all authentication data");
  },

  /**
   * Check and handle auth recovery on app startup
   */
  handleStartupAuthCheck(): void {
    if (this.isAuthDataMissing()) {
      console.log("🚨 Authentication data missing - likely temp files cleared");
      
      // Only clear corrupted data, don't auto-redirect
      this.clearAllAuthData();
    }
  }
};

export default AuthRecovery;
