import React from "react";

interface NavigationSafeWrapperProps {
  children: React.ReactNode;
}

export const NavigationSafeWrapper: React.FC<NavigationSafeWrapperProps> = ({
  children,
}) => {
  return <>{children}</>;
};
