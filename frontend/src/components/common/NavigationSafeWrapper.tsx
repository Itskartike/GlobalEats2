import React, { useEffect, useState, ReactNode } from "react";
import { useAuthStore } from "../../store/authStore";

interface NavigationSafeWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
  onUnauthenticated?: () => void;
}

/**
 * NavigationSafeWrapper - A component that safely handles authentication checks
 * during navigation without causing aggressive logouts
 */
export const NavigationSafeWrapper: React.FC<NavigationSafeWrapperProps> = ({
  children,
  requireAuth = false,
  fallback = null,
  onUnauthenticated,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Give the auth system a moment to initialize
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while auth is being determined
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (requireAuth && !isAuthenticated) {
    if (onUnauthenticated) {
      onUnauthenticated();
      return null;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    // Default fallback - don't render children
    return null;
  }

  return <>{children}</>;
};
