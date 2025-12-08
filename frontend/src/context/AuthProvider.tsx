import React, { useEffect, ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { AuthContext } from "../hooks/useAuth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setLoading, login, isAuthenticated, user } = useAuthStore();

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
            console.log("AuthProvider: Invalid response from profile API - keeping tokens for now");
            // Don't clear tokens here - let user try to use the app
          }
        })
        .catch((error) => {
          console.log("AuthProvider: Error validating token:", error.message);
          
          // Only clear tokens in very specific cases
          if (error.response?.status === 401 && 
              (error.response?.data?.code === "USER_INVALID" || 
               error.response?.data?.code === "TOKEN_INVALID")) {
            console.log("AuthProvider: Definitive invalid token, clearing auth data");
            localStorage.removeItem("auth-token");
            localStorage.removeItem("refresh-token");
          } else {
            console.log("AuthProvider: Network or temporary error, keeping tokens");
            // For network errors or other issues, keep the tokens
            // The user can still try to use the app and login manually if needed
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!storedToken) {
      console.log("AuthProvider: No stored token found");
      setLoading(false);
    } else {
      console.log("AuthProvider: User already authenticated or loading");
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
