import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/restaurants", icon: Search, label: "Browse" },
    { path: "/cart", icon: ShoppingBag, label: "Cart", badge: itemCount },
    { path: "/favorites", icon: Heart, label: "Saved" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  // Hide on specific pages if needed (e.g., inside explicit checkout flow)
  // if (location.pathname === '/checkout') return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-lg-up transition-transform duration-300">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-full py-1 transition-all duration-300 ${
                isActive ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-orange-50 transform -translate-y-1" : ""
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}
                />
                
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-1 right-2.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 hidden"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
