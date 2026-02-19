import axios from "axios";
import TokenManager from "../utils/tokenManager";

const API_URL = import.meta.env.VITE_API_URL || "https://globaleats-api.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token - STANDARDIZED
api.interceptors.request.use(
  (config) => {
    // Public endpoints that don't need authentication
    const publicEndpoints = [
      "/brands",
      "/outlets",
      "/menu",
      "/auth/register",
      "/auth/login",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/verify-email",
      "/auth/refresh-token",
      "/admin/login",
    ];

    // Check if the endpoint is public
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (isPublicEndpoint) {
      return config;
    }

    // Check if Authorization header is already explicitly set in this request
    if (config.headers?.Authorization || config.headers?.authorization) {
      return config;
    }

    // Check if admin token is set in defaults (for admin routes)
    if (api.defaults.headers.common?.Authorization) {
      // Use the admin token from defaults
      config.headers.Authorization = api.defaults.headers.common.Authorization;
      return config;
    }

    // For protected endpoints without admin token, use customer token
    const finalToken = TokenManager.getTokenForRequest();

    if (finalToken) {
      config.headers.Authorization = `Bearer ${finalToken}`;
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
      // Define endpoints that absolutely require authentication
      const strictlyProtectedEndpoints = [
        "/auth/profile",
        "/orders",
        "/addresses",
      ];
      const isStrictlyProtected = strictlyProtectedEndpoints.some((endpoint) =>
        originalRequest.url?.includes(endpoint)
      );

      // Define endpoints that might be called during navigation but shouldn't cause logout
      const navigationSafeEndpoints = [
        "/brands",
        "/outlets",
        "/menu-items",
        "/restaurants",
      ];
      const isNavigationSafe = navigationSafeEndpoints.some((endpoint) =>
        originalRequest.url?.includes(endpoint)
      );

      // If it's a navigation-safe endpoint, don't logout - just pass through the error
      if (isNavigationSafe) {
        return Promise.reject(error);
      }

      // For strictly protected endpoints, try token refresh first
      if (isStrictlyProtected) {
        const refreshToken = TokenManager.getRefreshToken();

        // Only attempt refresh if we have a refresh token and error indicates token expiry
        if (
          refreshToken &&
          (error.response?.data?.code === "TOKEN_EXPIRED" ||
            error.response?.data?.message?.toLowerCase().includes("expired") ||
            error.response?.data?.message?.toLowerCase().includes("invalid"))
        ) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await axios.post(
              `${API_URL}/auth/refresh-token`,
              { refreshToken },
              { timeout: 5000 } // 5 second timeout for refresh
            );

            if (refreshResponse.data.success) {
              const { token, refreshToken: newRefreshToken } =
                refreshResponse.data.data;

              // Update tokens using TokenManager
              TokenManager.setTokens(token, newRefreshToken);
              TokenManager.updateZustandToken(token);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            } else {
              // Token refresh failed
            }
          } catch (refreshError) {
            // Token refresh request failed
          }
        }

        // Only clear tokens if:
        // 1. We explicitly get USER_INVALID or TOKEN_INVALID codes
        // 2. OR refresh failed and we're sure the user session is dead
        const shouldClearTokens =
          error.response?.data?.code === "USER_INVALID" ||
          error.response?.data?.code === "TOKEN_INVALID" ||
          error.response?.data?.message
            ?.toLowerCase()
            .includes("user not found");

        if (shouldClearTokens) {
          TokenManager.clearTokens();
        }
      } else {
        // Non-critical endpoint, don't clear auth state
      }
    }

    return Promise.reject(error);
  }
);

export default api;
