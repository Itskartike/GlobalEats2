import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token - STANDARDIZED
api.interceptors.request.use(
  (config) => {
    // If Authorization header is already set (e.g., admin token), do not override
    if (config.headers?.Authorization || config.headers?.authorization || api.defaults.headers.common?.Authorization) {
      return config;
    }
    // Public endpoints that don't need authentication
    const publicEndpoints = [
      '/brands',
      '/outlets',
      '/menu',
      '/auth/register',
      '/auth/login',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/refresh-token',
      '/admin/login',
      '/admin/'
    ];

    // Check if the endpoint is public
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      // Use TokenManager for consistent token handling
      const finalToken = TokenManager.getTokenForRequest();

      console.log("API Interceptor: Token check", {
        hasToken: !!finalToken,
        url: config.url,
        isPublic: false
      });

      if (finalToken) {
        config.headers.Authorization = `Bearer ${finalToken}`;
      } else {
        console.warn(
          "API Interceptor: No token found for protected request to",
          config.url
        );
      }
    } else {
      console.log("API Interceptor: Public endpoint, skipping token", {
        url: config.url,
        isPublic: true
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("API: 401 error received", {
        url: originalRequest.url,
        hasRefreshToken: !!TokenManager.getRefreshToken(),
        errorCode: error.response?.data?.code,
        errorMessage: error.response?.data?.message
      });

      // Define endpoints that absolutely require authentication
      const strictlyProtectedEndpoints = ['/auth/profile', '/orders', '/addresses'];
      const isStrictlyProtected = strictlyProtectedEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );

      // Define endpoints that might be called during navigation but shouldn't cause logout
      const navigationSafeEndpoints = ['/brands', '/outlets', '/menu-items', '/restaurants'];
      const isNavigationSafe = navigationSafeEndpoints.some(endpoint =>
        originalRequest.url?.includes(endpoint)
      );

      // If it's a navigation-safe endpoint, don't logout - just pass through the error
      if (isNavigationSafe) {
        console.log("API: 401 on navigation-safe endpoint, allowing request to fail gracefully", {
          url: originalRequest.url
        });
        return Promise.reject(error);
      }

      // For strictly protected endpoints, try token refresh first
      if (isStrictlyProtected) {
        const refreshToken = TokenManager.getRefreshToken();

        // Only attempt refresh if we have a refresh token and error indicates token expiry
        if (refreshToken && (
          error.response?.data?.code === "TOKEN_EXPIRED" || 
          error.response?.data?.message?.toLowerCase().includes('expired') ||
          error.response?.data?.message?.toLowerCase().includes('invalid')
        )) {
          originalRequest._retry = true;

          try {
            console.log("API: Attempting token refresh for protected endpoint");
            const refreshResponse = await axios.post(
              `${API_URL}/auth/refresh-token`,
              { refreshToken },
              { timeout: 5000 } // 5 second timeout for refresh
            );

            if (refreshResponse.data.success) {
              const { token, refreshToken: newRefreshToken } = refreshResponse.data.data;

              // Update tokens using TokenManager
              TokenManager.setTokens(token, newRefreshToken);
              TokenManager.updateZustandToken(token);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              console.log("API: Token refreshed successfully, retrying request");
              return api(originalRequest);
            } else {
              console.log("API: Token refresh failed, response not successful");
            }
          } catch (refreshError) {
            console.error("API: Token refresh request failed:", refreshError);
          }
        }

        // Only clear tokens if:
        // 1. We explicitly get USER_INVALID or TOKEN_INVALID codes
        // 2. OR refresh failed and we're sure the user session is dead
        const shouldClearTokens = (
          error.response?.data?.code === "USER_INVALID" || 
          error.response?.data?.code === "TOKEN_INVALID" ||
          (error.response?.data?.message?.toLowerCase().includes('user not found'))
        );

        if (shouldClearTokens) {
          console.log("API: Clearing auth data due to definitive invalid session");
          TokenManager.clearTokens();
        } else {
          console.log("API: 401 on protected endpoint but not clearing tokens - letting component handle");
        }
      } else {
        // For other endpoints, just log and continue without clearing tokens
        console.log("API: 401 on non-critical endpoint, not clearing auth state", {
          url: originalRequest.url
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
