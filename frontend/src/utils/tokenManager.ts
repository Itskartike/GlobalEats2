// Centralized Token Management Utility
// This ensures consistent token handling across the entire application

const TOKEN_KEYS = {
  ACCESS_TOKEN: "auth-token",
  REFRESH_TOKEN: "refresh-token",
  AUTH_STORAGE: "auth-storage",
} as const;

export class TokenManager {
  // Get access token from primary storage
  static getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  // Set both tokens
  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);

    console.log("TokenManager: Tokens stored successfully");
  }

  // Clear all tokens and auth data
  static clearTokens(): void {
    // Clear standardized tokens
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);

    // Legacy cleanup - remove old inconsistent keys
    localStorage.removeItem("token");
    localStorage.removeItem("admin_auth_token");

    // Clear zustand auth storage
    const authStorage = localStorage.getItem(TOKEN_KEYS.AUTH_STORAGE);
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state) {
          parsed.state.user = null;
          parsed.state.token = null;
          parsed.state.isAuthenticated = false;
          localStorage.setItem(TOKEN_KEYS.AUTH_STORAGE, JSON.stringify(parsed));
        }
      } catch (err) {
        console.error("TokenManager: Error clearing auth-storage:", err);
        localStorage.removeItem(TOKEN_KEYS.AUTH_STORAGE);
      }
    }

    console.log("TokenManager: All tokens cleared");
  }

  // Check if user has valid tokens
  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return !!(accessToken && refreshToken);
  }

  // Get token for API requests (with fallback to zustand storage)
  static getTokenForRequest(): string | null {
    const accessToken = this.getAccessToken();

    if (accessToken) {
      return accessToken;
    }

    // Fallback to zustand storage
    const authStorage = localStorage.getItem(TOKEN_KEYS.AUTH_STORAGE);
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      } catch {
        console.warn("TokenManager: Failed to parse auth-storage fallback");
      }
    }

    return null;
  }

  // Update zustand storage token
  static updateZustandToken(token: string): void {
    const authStorage = localStorage.getItem(TOKEN_KEYS.AUTH_STORAGE);
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state) {
          parsed.state.token = token;
          localStorage.setItem(TOKEN_KEYS.AUTH_STORAGE, JSON.stringify(parsed));
        }
      } catch (err) {
        console.error("TokenManager: Error updating zustand token:", err);
      }
    }
  }
}

export default TokenManager;
