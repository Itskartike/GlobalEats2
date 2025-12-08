import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  Tag,
  ChefHat,
  ShoppingCart,
  Users,
  LogOut,
  Link2,
} from "lucide-react";
import adminService from "../services/adminService";

interface AdminLayoutProps {
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  const user = adminService.getUser();

  const handleLogout = () => {
    onLogout();
  };

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Outlets", href: "/admin/outlets", icon: Building2 },
    { name: "Brands", href: "/admin/brands", icon: Tag },
    { name: "Menus", href: "/admin/menus", icon: ChefHat },
    { name: "Outlet-Brands", href: "/admin/outlet-brands", icon: Link2 },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 w-64 h-screen bg-gray-900 text-white flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">GlobalEats Admin</h2>
          {user && (
            <p className="text-gray-300 text-sm mt-2">
              Welcome, {user.name || user.email}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section & Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="bg-gray-50 ml-64 min-h-screen">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
