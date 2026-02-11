import React, { useEffect, ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { AuthContext } from "../hooks/useAuth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setLoading, login, logout, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    console.log("AuthProvider: Initializing authentication state");

    // Check if user has a valid stored token
    const storedToken = authService.getToken();

    if (storedToken && !isAuthenticated && !user) {
      console.log(
        "AuthProvider: Found stored token, attempting to restore session"
      );
      setLoading(true);

      // Try to validate the token by fetching user profile
      authService
        .getProfile()
        .then((response) => {
          if (response.success && response.data) {
            console.log("AuthProvider: Token is valid, restoring user session");
            login(response.data.user, storedToken);
          } else {
            console.log("AuthProvider: Invalid response from profile API");
            // Don't auto-logout here, let the user try to login again
          }
        })
        .catch((error) => {
          console.log("AuthProvider: Error validating token:", error.message);
          // Only clear tokens if it's a 401 error, otherwise keep the user logged in
          if (error.response?.status === 401) {
            console.log("AuthProvider: 401 error, clearing invalid token");
            localStorage.removeItem("auth-token");
            localStorage.removeItem("refresh-token");
            // Don't call logout() here as it might cause side effects
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log(
        "AuthProvider: No stored token, already authenticated, or user already loaded"
      );
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run once on mount

  const contextValue = {
    isInitialized: true,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
